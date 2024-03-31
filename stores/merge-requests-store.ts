import { MergeRequestEvent, mergeRequestEventSchema } from '@/types';
import { action, makeObservable, observable } from 'mobx';
import { io } from 'socket.io-client';
import { z } from 'zod';

export class MergeRequestsStore {
    mergeRequestEvents: MergeRequestEvent[] = [];

    constructor() {
        makeObservable(this, {
            mergeRequestEvents: observable,
            setEvents: action
        });

        this.subscribe();
    }

    private subscribe() {
        const socket = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`);

        socket.on('connect', () => {
            console.log('client connected', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('client disconnected', socket.id);
        });

        socket.on('merge-requests', (payload) => {
            const events = z.array(mergeRequestEventSchema).parse(payload);
            this.setEvents(events);
        });
    }

    setEvents(data: MergeRequestEvent[]) {
        this.mergeRequestEvents = [...data];
    }
}
