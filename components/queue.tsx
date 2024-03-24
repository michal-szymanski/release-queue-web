'use client';

import { io } from 'socket.io-client';
import { useEffect } from 'react';

const Queue = () => {
    useEffect(() => {
        const socket = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}:${process.env.NEXT_PUBLIC_WEBSOCKET_PORT}`);
        socket.on('connect', () => {
            console.log('client connected', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('client disconnected', socket.id);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return <div>Hello from the server</div>;
};
export default Queue;
