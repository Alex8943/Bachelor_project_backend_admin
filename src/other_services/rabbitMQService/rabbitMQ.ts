import amqp from "amqplib";

const RABBITMQ_URL = "amqp://localhost"; // Update if RabbitMQ is hosted remotely

export async function createChannel() {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    return { connection, channel };
}