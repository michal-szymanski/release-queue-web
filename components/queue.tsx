'use client';

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { MergeRequestEvent, mergeRequestEventSchema } from '@/types';

const Queue = () => {
    const [events, setEvents] = useState<MergeRequestEvent[]>([]);

    useEffect(() => {
        const socket = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}:${process.env.NEXT_PUBLIC_WEBSOCKET_PORT}`);
        socket.on('connect', () => {
            console.log('client connected', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('client disconnected', socket.id);
        });

        socket.on('queue', (payload) => {
            if (payload) {
                const event = mergeRequestEventSchema.parse(JSON.parse(payload));
                console.log('receiving', event);
                setEvents((prev) => [...prev, event]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    if (!events.length) {
        return <div>Loading</div>;
    }

    return <div>Queue</div>;
};
export default Queue;
