import {
    JobEvent,
    jobEventSchema,
    MergeRequestEvent,
    mergeRequestEventSchema,
    mergeRequestsResponseSchema,
    PipelineEvent,
    pipelineEventSchema,
    rebaseResponseSchema
} from '@/types';
import { action, autorun, computed, IObservableArray, makeObservable, observable, reaction, runInAction } from 'mobx';
import { io } from 'socket.io-client';
import { z } from 'zod';
import { env } from '@/env';

export class DataStore {
    private _socket: ReturnType<typeof io> = io(env.NEXT_PUBLIC_WEBSOCKET_URL, {
        withCredentials: true
    });
    mergeRequestEvents: IObservableArray<{ json: MergeRequestEvent; rebaseError: string | null }>;
    pipelineEvents: IObservableArray<PipelineEvent>;
    jobEvents: IObservableArray<JobEvent>;
    queueMap: Map<string, { id: number; json: MergeRequestEvent; date: string; order: number; rebaseError: string | null }[]> = new Map();
    rebaseMap: Map<number, { inProgress: boolean; error: string | null }> = new Map();

    private _isQueueLoaded = false;

    constructor() {
        type PrivateMembers =
            | '_socket'
            | 'setMergeRequests'
            | 'updateQueueMap'
            | 'setPipelines'
            | 'setJobs'
            | 'setIsQueueLoaded'
            | '_isQueueLoaded'
            | 'rebaseNextQueueItem'
            | 'updateRebaseStatus';

        this.mergeRequestEvents = observable.array([]);
        this.pipelineEvents = observable.array([]);
        this.jobEvents = observable.array([]);

        makeObservable<DataStore, PrivateMembers>(this, {
            queueMap: observable,
            _socket: observable,
            setMergeRequests: action,
            addToQueue: action,
            removeFromQueue: action,
            updateQueueMap: action,
            setPipelines: action,
            setJobs: action,
            stepBackInQueue: action,
            _isQueueLoaded: observable,
            isQueueEmpty: computed,
            setIsQueueLoaded: action,
            rebaseMap: observable,
            rebaseNextQueueItem: action,
            updateRebaseStatus: action
        });

        this.addToQueue = this.addToQueue.bind(this);
        this.removeFromQueue = this.removeFromQueue.bind(this);
        this.stepBackInQueue = this.stepBackInQueue.bind(this);
        this.rebaseNextQueueItem = this.rebaseNextQueueItem.bind(this);

        this.subscribe();

        autorun(async () => {
            const pipelineEvents = this.pipelineEvents.slice();
            const mergeRequests = this.mergeRequestEvents.slice().map((mr) => mr.json);
            const queueItems = Array.from(this.queueMap.values()).flatMap((value) => value.flatMap((innerValue) => innerValue.json));

            for (const pipeline of pipelineEvents) {
                const mergeRequest =
                    mergeRequests.find((mr) => mr.object_attributes.last_commit.id === pipeline.commit.id || mr.object_attributes.merge_commit_sha) ??
                    queueItems.find(
                        (qi) => qi.object_attributes.last_commit.id === pipeline.commit.id || qi.object_attributes.merge_commit_sha === pipeline.commit.id
                    );

                if (mergeRequest) {
                    await this.updateRebaseStatus(mergeRequest);
                }
            }
        });
    }

    private subscribe() {
        this._socket.on('connect', () => {
            console.log(`Client connected. id: ${this._socket.id}`);
        });

        this._socket.on('disconnect', () => {
            console.log(`Client disconnected. id: ${this._socket.id}`);
        });

        this._socket.on('merge-requests', (payload) => {
            const events = z.array(z.object({ json: mergeRequestEventSchema, rebaseError: z.string().nullable() })).parse(payload);
            this.setMergeRequests(events);
        });

        this._socket.on('queue', (payload) => {
            const queueItems = z
                .array(
                    z.object({
                        id: z.number(),
                        json: mergeRequestEventSchema,
                        date: z.string().datetime(),
                        order: z.number(),
                        rebaseError: z.string().nullable()
                    })
                )
                .parse(payload);
            this.setIsQueueLoaded();
            this.updateQueueMap(queueItems);
        });

        this._socket.on('pipelines', (payload) => {
            const events = z.array(pipelineEventSchema).parse(payload);
            this.setPipelines(events);
        });

        this._socket.on('jobs', (payload) => {
            const events = z.array(jobEventSchema).parse(payload);
            this.setJobs(events);
        });
    }

    private setMergeRequests(events: { json: MergeRequestEvent; rebaseError: string | null }[]) {
        this.mergeRequestEvents.replace(
            [...events].sort((a, b) => new Date(b.json.object_attributes.updated_at).getTime() - new Date(a.json.object_attributes.updated_at).getTime())
        );
    }

    private updateQueueMap(queueItems: { id: number; json: MergeRequestEvent; date: string; order: number; rebaseError: string | null }[]) {
        const repositoriesInQueue = Array.from(new Set(queueItems.map((queueItem) => queueItem.json.repository.name)));
        const keysToRemove = Array.from(this.queueMap.keys()).filter((key) => !repositoriesInQueue.includes(key));

        for (const key of keysToRemove) {
            this.queueMap.delete(key);
        }

        for (const repositoryName of repositoriesInQueue) {
            const queue = queueItems.filter((queueItem) => queueItem.json.repository.name === repositoryName);
            this.queueMap.set(repositoryName, queue);
        }
    }

    private setPipelines(events: PipelineEvent[]) {
        this.pipelineEvents.replace([...events]);
    }

    private setJobs(events: JobEvent[]) {
        this.jobEvents.replace([...events]);
    }

    addToQueue(event: MergeRequestEvent, isoString: string) {
        this._socket.emit('add-to-queue', {
            mergeRequestIid: event.object_attributes.iid,
            isoString: z.string().datetime().parse(isoString)
        });
    }

    async removeFromQueue(event: MergeRequestEvent) {
        this._socket.emit('remove-from-queue', event.object_attributes.iid);

        if (event.object_attributes.action === 'merge') {
            await this.rebaseNextQueueItem(event);
        }
    }

    stepBackInQueue(event: MergeRequestEvent) {
        this._socket.emit('step-back-in-queue', event.object_attributes.iid);
    }

    private setIsQueueLoaded() {
        this._isQueueLoaded = true;
    }

    private async rebaseNextQueueItem(event: MergeRequestEvent) {
        const currentOrder = this.queueMap
            .get(event.project.name)
            ?.find((queueItem) => queueItem.json.object_attributes.iid === event.object_attributes.iid)?.order;

        const nextMergeRequest = this.queueMap.get(event.project.name)?.find((queueItem) => queueItem.order > (currentOrder ?? 0))?.json;

        if (nextMergeRequest) {
            const url = `/api/gitlab/projects/${nextMergeRequest.project.id}/merge-requests/${nextMergeRequest.object_attributes.iid}/rebase`;
            const response = await fetch(url, {
                method: 'POST'
            });

            if (response.ok) {
                const json = await response.json();

                const {
                    payload: { rebase_in_progress }
                } = rebaseResponseSchema.parse(json);

                runInAction(() => {
                    this.rebaseMap.set(nextMergeRequest.object_attributes.iid, { inProgress: rebase_in_progress, error: null });
                });

                await this.updateRebaseStatus(nextMergeRequest);
            }
        }
    }

    private async updateRebaseStatus(event: MergeRequestEvent) {
        const url = `/api/gitlab/projects/${event.project.id}/merge-requests/${event.object_attributes.iid}`;

        const response = await fetch(url, {
            method: 'GET'
        });

        if (response.ok) {
            const json = await response.json();
            const {
                payload: { iid, merge_error, rebase_in_progress }
            } = mergeRequestsResponseSchema.parse(json);

            runInAction(() => {
                this.rebaseMap.set(iid, { inProgress: rebase_in_progress, error: merge_error });
            });
        }
    }

    get isQueueEmpty() {
        return this._isQueueLoaded && this.queueMap.size === 0;
    }
}
