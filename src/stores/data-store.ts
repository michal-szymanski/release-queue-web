import {
    EventModelParams,
    eventModelParamsSchema,
    JobEvent,
    jobEventSchema,
    MergeRequestEvent,
    mergeRequestEventSchema,
    PipelineEvent,
    pipelineEventSchema
} from '@/types';
import { action, computed, IObservableArray, makeObservable, observable, runInAction } from 'mobx';
import { io } from 'socket.io-client';
import { z } from 'zod';
import { env } from '@/env';
import { EventModel } from '@/models/event-model';

export class DataStore {
    queueMap: Map<string, { id: number; model: EventModel; date: string; order: number }[]> = new Map();
    models: IObservableArray<EventModel>;

    private _socket: ReturnType<typeof io> = io(env.NEXT_PUBLIC_WEBSOCKET_URL, { withCredentials: true });
    private _isQueueLoaded = false;
    private _unassignedJobs: IObservableArray<JobEvent>;
    private _unassignedPipelines: IObservableArray<PipelineEvent>;

    constructor() {
        type PrivateMembers = 'updateQueueMap' | 'setIsQueueLoaded' | '_socket' | 'setModels' | 'addModel' | '_isQueueLoaded';

        this.models = observable.array([]);
        this._unassignedJobs = observable.array([]);
        this._unassignedPipelines = observable.array([]);

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
        this.getModelsByUserId = this.getModelsByUserId.bind(this);

        this.subscribe();
    }

    addToQueue(event: MergeRequestEvent, isoString: string) {
        this._socket.emit('add-to-queue', {
            mergeRequestIid: event.object_attributes.iid,
            isoString: z.string().datetime().parse(isoString)
        });
    }

    async removeFromQueue(model: EventModel) {
        this._socket.emit('remove-from-queue', model.mergeRequest.object_attributes.iid);

        if (model.mergeRequest.object_attributes.state === 'merged') {
            this.models.remove(model);
        }
    }

    stepBackInQueue(model: EventModel) {
        this._socket.emit('step-back-in-queue', model.mergeRequest.object_attributes.iid);
    }

    get isQueueEmpty() {
        return this._isQueueLoaded && this.queueMap.size === 0;
    }

    getModelsByUserId(rawUserId: string) {
        const queueItems = Array.from(this.queueMap.values()).flatMap((item) => item);

        try {
            const userId = z.coerce.number().parse(rawUserId);

            return this.models
                .filter(
                    (model) =>
                        model.mergeRequest.object_attributes.author_id === userId &&
                        !queueItems.some((item) => item.model.mergeRequest.object_attributes.iid === model.mergeRequest.object_attributes.iid)
                )
                .slice();
        } catch {
            return [];
        }
    }

    private setModels(params: EventModelParams[]) {
        const models = params.map((param) => new EventModel(param));
        this.models.replace(models);
    }

    private addModel(params: EventModelParams) {
        this.models.push(new EventModel(params));
    }

    private updateQueueMap(queueItems: { id: number; mergeRequestIid: number; date: string; order: number }[]) {
        const queueData: { id: number; model: EventModel; date: string; order: number }[] = [];

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
            const params = z.array(eventModelParamsSchema).parse(payload);
            this.setModels(params);
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
            console.log('merge-request');

            const message = mergeRequestEventSchema.parse(payload);

            const model = this.models.find((model) => model.mergeRequest.object_attributes.iid === message.object_attributes.iid);
            const unassignedJobs = this._unassignedJobs.filter((job) => job.commit.sha === message.object_attributes.last_commit.id);
            const unassignedPipeline = this._unassignedPipelines.find((pipeline) => pipeline.commit.id === message.object_attributes.last_commit.id);

            if (model) {
                model.updateMergeRequest(message);

                if (model.mergeRequest.object_attributes.state === 'merged') return;

                if (unassignedPipeline) {
                    model.updatePipeline(unassignedPipeline);
                }

                if (unassignedJobs.length) {
                    model.clearJobs();

                    for (const job of unassignedJobs) {
                        model.updateJob(job);
                    }
                }
            } else {
                this.addModel({
                    mergeRequest: message,
                    jobs: unassignedJobs,
                    pipeline: unassignedPipeline ?? null
                });
            }

            if (unassignedJobs.length) {
                runInAction(() => {
                    this._unassignedJobs.replace(this._unassignedJobs.filter((uj) => unassignedJobs.some((j) => uj.build_id === j.build_id)));
                });
            }

            if (unassignedPipeline) {
                runInAction(() => {
                    this._unassignedPipelines.remove(unassignedPipeline);
                });
            }
        });

        this._socket.on('pipeline', (payload) => {
            console.log('pipeline');

            const message = pipelineEventSchema.parse(payload);

            const model = this.models.find((model) => model.mergeRequest.object_attributes.last_commit.id === message.commit.id);

            if (!model) {
                runInAction(() => {
                    this._unassignedPipelines.push(message);
                });
                return;
            }

            if (model.mergeRequest.object_attributes.state === 'merged') return;

            model.updatePipeline(message);
        });

        this._socket.on('job', (payload) => {
            console.log('job');

            const message = jobEventSchema.parse(payload);

            const model = this.models.find((model) => model.mergeRequest.object_attributes.last_commit.id === message.commit.sha);

            if (model?.mergeRequest.object_attributes.state === 'merged') return;

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

        this._socket.on('repository-update', async (payload) => {
            console.log('repository-update', payload);

            const repositoryName = z.string().parse(payload);

            const modelsToUpdate = this.models.filter(
                (model) => model.mergeRequest.project.name === repositoryName && model.mergeRequest.object_attributes.state === 'opened'
            );

            for (const model of modelsToUpdate) {
                await model.updateMetadata();
            }
        });
    }

    private setIsQueueLoaded() {
        this._isQueueLoaded = true;
    }
}
