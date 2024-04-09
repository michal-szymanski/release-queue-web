import { MergeRequestEvent, mergeRequestEventSchema, PipelineEvent, pipelineEventSchema } from '@/types';
import { action, computed, makeObservable, observable } from 'mobx';
import { io } from 'socket.io-client';
import { z } from 'zod';

export class DataStore {
    mergeRequestEvents: MergeRequestEvent[] = [];
    private socket: ReturnType<typeof io> = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`, {
        withCredentials: true
    });
    queueMap: Map<string, { id: number; json: MergeRequestEvent }[]> = new Map();
    pipelines: PipelineEvent[] = [];

    constructor() {
        makeObservable<DataStore, 'socket' | 'setMergeRequests' | 'updateQueueMap' | 'setPipelines'>(this, {
            mergeRequestEvents: observable,
            queueMap: observable,
            socket: observable,
            setMergeRequests: action,
            addToQueue: action,
            removeFromQueue: action,
            updateQueueMap: action,
            queueKeys: computed,
            pipelines: observable,
            setPipelines: action
        });

        this.addToQueue = this.addToQueue.bind(this);
        this.removeFromQueue = this.removeFromQueue.bind(this);

        this.subscribe();
    }

    private subscribe() {
        this.socket.on('connect', () => {
            console.log(`Client connected. id: ${this.socket.id}`);
        });

        this.socket.on('disconnect', () => {
            console.log(`Client disconnected. id: ${this.socket.id}`);
        });

        this.socket.on('merge-requests', (payload) => {
            const events = z.array(mergeRequestEventSchema).parse(payload);
            this.setMergeRequests(events);
        });

        this.socket.on('queue', (payload) => {
            const queueItems = z.array(z.object({ id: z.number(), json: mergeRequestEventSchema })).parse(payload);
            this.updateQueueMap(queueItems);
        });

        this.socket.on('pipelines', (payload) => {
            const events = z.array(pipelineEventSchema).parse(payload);
            this.setPipelines(events);
        });
    }

    private setMergeRequests(events: MergeRequestEvent[]) {
        this.mergeRequestEvents = [...events];
    }

    private updateQueueMap(queueItems: { id: number; json: MergeRequestEvent }[]) {
        const repositoriesInQueue = Array.from(new Set(queueItems.map((queueItem) => queueItem.json.repository.name)));
        const keysToRemove = [...this.queueKeys].filter((key) => !repositoriesInQueue.includes(key));

        for (const key of keysToRemove) {
            this.queueMap.delete(key);
        }

        for (const repositoryName of repositoriesInQueue) {
            const queue = queueItems.filter((queueItem) => queueItem.json.repository.name === repositoryName);
            this.queueMap.set(repositoryName, queue);
        }
    }

    private setPipelines(events: PipelineEvent[]) {
        this.pipelines = [...events];
    }

    addToQueue(event: MergeRequestEvent) {
        this.socket.emit('add-to-queue', event.object_attributes.id);
    }

    removeFromQueue(event: MergeRequestEvent) {
        this.socket.emit('remove-from-queue', event.object_attributes.id);
    }

    get queueKeys() {
        return Array.from(this.queueMap.keys());
    }
}
