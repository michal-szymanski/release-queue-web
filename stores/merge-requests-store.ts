'use client';

import { MergeRequestEvent, mergeRequestEventSchema } from '@/types';
import { action, makeObservable, observable } from 'mobx';
import { io } from 'socket.io-client';
import { z } from 'zod';

export class MergeRequestsStore {
    mergeRequestsEvents: MergeRequestEvent[] = [];

    constructor() {
        makeObservable(this, {
            mergeRequestsEvents: observable,
            setEvents: action
        });

        const socket = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`, {});

        socket.on('connect', () => {
            console.log('client connected', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('client disconnected', socket.id);
        });

        socket.on('merge-requests', (payload) => {
            // console.log(payload);
            console.log('mobx');
            const events = z.array(mergeRequestEventSchema).parse(payload);
            this.setEvents(events);
        });
    }

    setEvents(data: MergeRequestEvent[]) {
        this.mergeRequestsEvents = [...data];
    }
}
