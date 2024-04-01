import { MergeRequestEvent, mergeRequestEventSchema } from '@/types';
import { action, makeObservable, observable } from 'mobx';
import { io } from 'socket.io-client';
import { z } from 'zod';

export class MergeRequestsStore {
    mergeRequestEvents: MergeRequestEvent[] = [];
    queue: MergeRequestEvent[] = [];
    private socket: ReturnType<typeof io> = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`);

    constructor() {
        makeObservable<MergeRequestsStore, 'socket' | 'setEvents' | 'setQueue'>(this, {
            mergeRequestEvents: observable,
            queue: observable,
            socket: observable,
            setEvents: action,
            setQueue: action,
            addToQueue: action,
            removeFromQueue: action
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
            this.setEvents(events);
        });

        this.socket.on('queue', (payload) => {
            const queueItems = z.array(mergeRequestEventSchema).parse(payload);
            this.setQueue(queueItems);
        });
    }

    private setEvents(events: MergeRequestEvent[]) {
        this.mergeRequestEvents = [...events];
    }

    private setQueue(events: MergeRequestEvent[]) {
        this.queue = [...events];
    }

    addToQueue(event: MergeRequestEvent) {
        this.socket.emit('add-to-queue', event.object_attributes.id);
    }

    removeFromQueue(event: MergeRequestEvent) {
        this.socket.emit('remove-from-queue', event.object_attributes.id);
    }
}
