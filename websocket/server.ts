import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.WEB_APP_URL
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
});

const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
const port = process.env.NEXT_PUBLIC_WEBSOCKET_PORT;

server.listen(port, () => {
    console.log(`Websocket server running at ${url}:${port}`);
});
