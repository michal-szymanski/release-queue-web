'use client';

import { io } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import { MergeRequestEvent, mergeRequestEventSchema } from '@/types';
import QueueItem from '@/components/queue-item';
import autoAnimate from '@formkit/auto-animate';
import { z } from 'zod';

const Queue = () => {
    const [events, setEvents] = useState<MergeRequestEvent[]>([]);
    const parent = useRef(null);

    useEffect(() => {
        const socket = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`);
        socket.on('connect', () => {
            console.log('client connected', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('client disconnected', socket.id);
        });

        socket.on('merge-requests', (payload) => {
            console.log(payload);
            const events = z.array(mergeRequestEventSchema).parse(payload);
            console.log(events);
            setEvents(events);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (parent.current) {
            autoAnimate(parent.current);
        }
    }, [parent]);

    if (!events.length) {
        return <div>Loading</div>;
    }

    return (
        <div>
            <div ref={parent} className="flex flex-col gap-2">
                {events.map((event) => (
                    <QueueItem key={event.object_attributes.id} event={event} />
                ))}
            </div>
        </div>
    );
};
export default Queue;
