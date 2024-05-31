import { EventModel, eventModelSchema, JobEvent, jobEventSchema, MergeRequestEvent, mergeRequestEventSchema, pipelineEventSchema } from '@/types';
import { action, computed, IObservableArray, makeObservable, observable, runInAction } from 'mobx';
import { io } from 'socket.io-client';
import { z } from 'zod';
import { env } from '@/env';
import { EventStore } from '@/stores/event-store';

export class DataStore {
    queueMap: Map<string, { id: number; model: EventStore; date: string; order: number }[]> = new Map();
    models: IObservableArray<EventStore>;

    private _socket: ReturnType<typeof io> = io(env.NEXT_PUBLIC_WEBSOCKET_URL, { withCredentials: true });
    private _isQueueLoaded = false;
    private _unassignedJobs: IObservableArray<JobEvent>;

    constructor() {
        type PrivateMembers = 'updateQueueMap' | 'setIsQueueLoaded' | '_socket' | 'setModels' | 'addModel' | '_isQueueLoaded';

        this.models = observable.array([]);
        this._unassignedJobs = observable.array([]);

        makeObservable<DataStore, PrivateMembers>(this, {
            // Observables
            queueMap: observable,
            _socket: observable,
            _isQueueLoaded: observable,

            // Actions
            stepBackInQueue: action,
            addToQueue: action,
            removeFromQueue: action,
            updateQueueMap: action,
            setIsQueueLoaded: action,
            setModels: action,
            addModel: action,

            // Computed
            isQueueEmpty: computed
        });

        this.addToQueue = this.addToQueue.bind(this);
        this.removeFromQueue = this.removeFromQueue.bind(this);
        this.stepBackInQueue = this.stepBackInQueue.bind(this);
        this.getMergeRequestsByUserId = this.getMergeRequestsByUserId.bind(this);

        this.subscribe();
    }

    addToQueue(event: MergeRequestEvent, isoString: string) {
        this._socket.emit('add-to-queue', {
            mergeRequestIid: event.object_attributes.iid,
            isoString: z.string().datetime().parse(isoString)
        });
    }

    async removeFromQueue(event: MergeRequestEvent) {
        this._socket.emit('remove-from-queue', event.object_attributes.iid);
    }

    stepBackInQueue(event: MergeRequestEvent) {
        this._socket.emit('step-back-in-queue', event.object_attributes.iid);
    }

    get isQueueEmpty() {
        return this._isQueueLoaded && this.queueMap.size === 0;
    }

    getMergeRequestsByUserId(userId: number) {
        const queueItems = Array.from(this.queueMap.values()).flatMap((item) => item);

        return this.models
            .filter(
                (model) =>
                    model.mergeRequest.object_attributes.author_id === userId &&
                    !queueItems.some((item) => item.model.mergeRequest.object_attributes.iid === model.mergeRequest.object_attributes.iid)
            )
            .slice();
    }

    private setModels(events: EventModel[]) {
        const models = events.map((model) => new EventStore(model));
        this.models.replace(models);
    }

    private addModel(event: EventModel) {
        this.models.push(new EventStore(event));
    }

    private updateQueueMap(queueItems: { id: number; mergeRequestIid: number; date: string; order: number }[]) {
        const queueData: { id: number; model: EventStore; date: string; order: number }[] = [];

        for (const { mergeRequestIid, ...rest } of queueItems) {
            const model = this.models.find((model) => model.mergeRequest.object_attributes.iid === mergeRequestIid);
            if (model) {
                queueData.push({ ...rest, model });
            }
        }

        const repositoriesInQueue = Array.from(new Set(queueData.map((queueItem) => queueItem.model.mergeRequest.repository.name)));
        const keysToRemove = Array.from(this.queueMap.keys()).filter((key) => !repositoriesInQueue.includes(key));

        for (const key of keysToRemove) {
            this.queueMap.delete(key);
        }

        for (const repositoryName of repositoriesInQueue) {
            const queue = queueData.filter((queueItem) => queueItem.model.mergeRequest.repository.name === repositoryName);
            this.queueMap.set(repositoryName, queue);
        }
    }

    private subscribe() {
        this._socket.on('connect', () => {
            console.log(`Client connected. id: ${this._socket.id}`);
        });

        this._socket.on('disconnect', () => {
            console.log(`Client disconnected. id: ${this._socket.id}`);
        });

        this._socket.on('events', (payload) => {
            const events = z.array(eventModelSchema).parse(payload);
            this.setModels(events);
        });

        this._socket.on('queue', (payload) => {
            const queueItems = z
                .array(
                    z.object({
                        id: z.number(),
                        mergeRequestIid: z.number(),
                        date: z.string().datetime(),
                        order: z.number()
                    })
                )
                .parse(payload);
            this.setIsQueueLoaded();
            this.updateQueueMap(queueItems);
        });

        this._socket.on('merge-request', (payload) => {
            const message = mergeRequestEventSchema.parse(payload);

            const model = this.models.find((model) => model.mergeRequest.object_attributes.iid === message.object_attributes.iid);
            const unassignedJobs = this._unassignedJobs.filter((job) => job.commit.sha === message.object_attributes.last_commit.id);

            if (model) {
                model.updateMergeRequest(message);

                if (unassignedJobs.length) {
                    model.clearJobs();

                    for (let job of unassignedJobs) {
                        model.updateJob(job);
                    }
                }
            } else {
                this.addModel({
                    mergeRequest: message,
                    jobs: unassignedJobs
                });
            }

            if (unassignedJobs.length) {
                runInAction(() => {
                    this._unassignedJobs.replace(this._unassignedJobs.filter((uj) => unassignedJobs.some((j) => uj.build_id === j.build_id)));
                });
            }
        });

        this._socket.on('pipeline', (payload) => {
            const message = pipelineEventSchema.parse(payload);

            const model = this.models.find((model) => model.mergeRequest.object_attributes.last_commit.id === message.commit.id);

            if (!model) return;

            model.updatePipeline(message);
        });

        this._socket.on('job', (payload) => {
            const message = jobEventSchema.parse(payload);

            const model = this.models.find((model) => model.mergeRequest.object_attributes.last_commit.id === message.commit.sha);
            if (model) {
                model.updateJob(message);
            } else {
                runInAction(() => {
                    const jobs = this._unassignedJobs.map((j) => {
                        if (j.build_id === message.build_id) {
                            return message;
                        }
                        return j;
                    });

                    if (!jobs.some((j) => j.build_id === message.build_id)) {
                        jobs.push(message);
                    }

                    this._unassignedJobs.replace(jobs);
                });
            }
        });
    }

    private setIsQueueLoaded() {
        this._isQueueLoaded = true;
    }
}
