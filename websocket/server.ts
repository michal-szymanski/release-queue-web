import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { Kafka, logLevel } from 'kafkajs';
import { gitlabWebhookEvent } from '@/types';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.WEB_APP_URL
    }
});

app.post('/webhook', (req, res) => {
    const payload = req.body;
    const event = req.headers['x-gitlab-event'];
    console.log(event);
    console.log('Webhook', payload);
    res.status(200).end();
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
            eachMessage: async ({ message, heartbeat }) => {
                const payload = JSON.parse(message.value?.toString() ?? '');
                const { object_kind } = gitlabWebhookEvent.parse(payload);
                socket.emit(object_kind, payload);
                await heartbeat();
            }
        });
    };

    run().catch((e) => console.error('Kafka error', e));
});

const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
const port = process.env.NEXT_PUBLIC_WEBSOCKET_PORT;

server.listen(port, () => {
    console.log(`Websocket server running at ${url}:${port}`);
});
