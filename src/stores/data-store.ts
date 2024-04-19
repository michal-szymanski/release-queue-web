import { JobEvent, jobEventSchema, MergeRequestEvent, mergeRequestEventSchema, PipelineEvent, pipelineEventSchema } from '@/types';
import { action, computed, makeObservable, observable } from 'mobx';
import { io } from 'socket.io-client';
import { z } from 'zod';
import { env } from '@/env';

export class DataStore {
    private _socket: ReturnType<typeof io> = io(env.NEXT_PUBLIC_WEBSOCKET_URL, {
        withCredentials: true
    });
    mergeRequestEvents: MergeRequestEvent[] = [];
    pipelineEvents: PipelineEvent[] = [];
    jobEvents: JobEvent[] = [];
    queueMap: Map<string, { id: number; json: MergeRequestEvent; date: string }[]> = new Map();
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
            const events = z.array(mergeRequestEventSchema).parse(payload);
            this.setMergeRequests(events);
        });

        this._socket.on('queue', (payload) => {
            const queueItems = z.array(z.object({ id: z.number(), json: mergeRequestEventSchema, date: z.string().datetime() })).parse(payload);
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

    private setMergeRequests(events: MergeRequestEvent[]) {
        this.mergeRequestEvents = [...events].sort(
            (a, b) => new Date(b.object_attributes.updated_at).getTime() - new Date(a.object_attributes.updated_at).getTime()
        );
    }

    private updateQueueMap(queueItems: { id: number; json: MergeRequestEvent; date: string }[]) {
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
            mergeRequestId: event.object_attributes.id,
            isoString: z.string().datetime().parse(isoString)
        });
    }

    removeFromQueue(event: MergeRequestEvent) {
        this._socket.emit('remove-from-queue', event.object_attributes.id);
    }

    stepBackInQueue(event: MergeRequestEvent) {
        this._socket.emit('step-back-in-queue', event.object_attributes.id);
    }

    private setIsQueueLoaded() {
        this._isQueueLoaded = true;
    }

    get isQueueEmpty() {
        return this._isQueueLoaded && this.queueMap.size === 0;
    }
}
