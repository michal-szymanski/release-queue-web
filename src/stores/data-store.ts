import { JobEvent, jobEventSchema, MergeRequestEvent, mergeRequestEventSchema, PipelineEvent, pipelineEventSchema, rebaseResponseSchema } from '@/types';
import { action, computed, makeObservable, observable } from 'mobx';
import { io } from 'socket.io-client';
import { z } from 'zod';
import { env } from '@/env';

export class DataStore {
    private _socket: ReturnType<typeof io> = io(env.NEXT_PUBLIC_WEBSOCKET_URL, {
        withCredentials: true
    });
    mergeRequestEvents: { json: MergeRequestEvent; rebaseError: string | null }[] = [];
    pipelineEvents: PipelineEvent[] = [];
    jobEvents: JobEvent[] = [];
    queueMap: Map<string, { id: number; json: MergeRequestEvent; date: string; order: number; rebaseError: string | null }[]> = new Map();
    private _isQueueLoaded = false;

    constructor() {
        type PrivateMembers = '_socket' | 'setMergeRequests' | 'updateQueueMap' | 'setPipelines' | 'setJobs' | 'setIsQueueLoaded' | '_isQueueLoaded';

        makeObservable<DataStore, PrivateMembers>(this, {
            mergeRequestEvents: observable,
            queueMap: observable,
            _socket: observable,
            setMergeRequests: action,
            addToQueue: action,
            removeFromQueue: action,
            updateQueueMap: action,
            pipelineEvents: observable,
            setPipelines: action,
            jobEvents: observable,
            setJobs: action,
            stepBackInQueue: action,
            _isQueueLoaded: observable,
            isQueueEmpty: computed,
            setIsQueueLoaded: action
        });

        this.addToQueue = this.addToQueue.bind(this);
        this.removeFromQueue = this.removeFromQueue.bind(this);
        this.stepBackInQueue = this.stepBackInQueue.bind(this);
        this.rebaseNextQueueItem = this.rebaseNextQueueItem.bind(this);

        this.subscribe();
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
        this.mergeRequestEvents = [...events].sort(
            (a, b) => new Date(b.json.object_attributes.updated_at).getTime() - new Date(a.json.object_attributes.updated_at).getTime()
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
        this.pipelineEvents = [...events];
    }

    private setJobs(events: JobEvent[]) {
        this.jobEvents = [...events];
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

        const nextMergeRequest = this.queueMap.get(event.project.name)?.find((queueItem) => queueItem.order > (currentOrder ?? 0));
        if (nextMergeRequest) {
            const response = await fetch('/api/gitlab/rebase', {
                method: 'POST',
                body: JSON.stringify({ projectId: nextMergeRequest.json.project.id, mergeRequestIid: nextMergeRequest.json.object_attributes.iid })
            });

            if (response.ok) {
                const json = await response.json();
                const { mergeRequest } = rebaseResponseSchema.parse(json);

                if (mergeRequest.payload?.merge_error) {
                    this._socket.emit('add-rebase-error', {
                        mergeRequestIid: nextMergeRequest.json.object_attributes.iid,
                        rebaseError: mergeRequest.payload.merge_error
                    });
                }
            }
        }
    }

    get isQueueEmpty() {
        return this._isQueueLoaded && this.queueMap.size === 0;
    }
}
