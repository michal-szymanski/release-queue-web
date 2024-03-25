'use client';

import { io } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import { MergeRequestEvent, mergeRequestEventSchema, objectKindSchema } from '@/types';
import QueueItem from '@/components/queue-item';
import autoAnimate from '@formkit/auto-animate';

const Queue = () => {
    const [events, setEvents] = useState<MergeRequestEvent[]>([]);
    const parent = useRef(null);

    useEffect(() => {
        const socket = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}:${process.env.NEXT_PUBLIC_WEBSOCKET_PORT}`);
        socket.on('connect', () => {
            console.log('client connected', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('client disconnected', socket.id);
        });

        socket.on(objectKindSchema.Enum.merge_request, (payload) => {
            const event = mergeRequestEventSchema.parse(payload);
            console.log(event);
            setEvents((prev) => [...prev.filter((e) => e.object_attributes.id !== event.object_attributes.id), event]);
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
