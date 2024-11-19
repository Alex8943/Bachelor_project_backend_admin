import amqplib from 'amqplib';

const RABBITMQ_URL = 'amqp://localhost'; // Replace with your RabbitMQ URL if hosted remotely

let channel: amqplib.Channel;

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqplib.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
};

export const publishMessage = async (queue: string, message: any) => {
    if (!channel) {
        throw new Error('RabbitMQ channel is not initialized. Call connectRabbitMQ first.');
    }
    try {
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        console.log(`Message sent to queue "${queue}":`, message);
    } catch (error) {
        console.error('Failed to publish message:', error);
        throw error;
    }
};