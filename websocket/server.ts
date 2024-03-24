import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { Kafka, logLevel } from 'kafkajs';

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.WEB_APP_URL
    }
});

io.on('connection', (socket) => {
    const upstashKafkaBroker = process.env.NEXT_PUBLIC_UPSTASH_KAFKA_BROKER ?? '';
    const username = process.env.NEXT_PUBLIC_UPSTASH_KAFKA_REST_USERNAME ?? '';
    const password = process.env.NEXT_PUBLIC_UPSTASH_KAFKA_REST_PASSWORD ?? '';

    const kafka = new Kafka({
        brokers: [upstashKafkaBroker],
        ssl: true,
        sasl: {
            mechanism: 'scram-sha-256',
            username,
            password
        },
        logLevel: logLevel.ERROR
    });

    const consumer = kafka.consumer({ groupId: socket.id });

    const run = async () => {
        await consumer.connect();
        await consumer.subscribe({ topic: 'gitlab-webhook', fromBeginning: true });
        await consumer.run({
            eachMessage: async ({ topic, partition, message, heartbeat }) => {
                socket.emit('queue', message.value?.toString());
                await heartbeat();
            }
        });
    };

    run().catch((e) => console.error('Upstash Kafka error', e));
    console.log('a user connected');
});

const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
const port = process.env.NEXT_PUBLIC_WEBSOCKET_PORT;

server.listen(port, () => {
    console.log(`Websocket server running at ${url}:${port}`);
});
