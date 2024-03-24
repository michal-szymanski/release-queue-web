'use client';

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

const Queue = () => {
    const [payloads, setPayloads] = useState<object[]>([]);

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
                setPayloads((prev) => [...prev, payload]);
                console.log('receiving', JSON.parse(payload));
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div>
            {/*{payloads.map((p, i) => (*/}
            {/*    <div key={i}>{JSON.stringify(p)}</div>*/}
            {/*))}*/}
            Queue
        </div>
    );
};
export default Queue;
