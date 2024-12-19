import amqp, { Channel, Connection } from "amqplib";

const RABBITMQ_URL = "amqp://127.0.0.1"; // Update if RabbitMQ is hosted remotely

let connection: Connection | null = null;
let channel: Channel | null = null;

// Create or reuse a RabbitMQ channel
export async function createChannel() {
    if (!connection) {
        connection = await amqp.connect(RABBITMQ_URL);
        console.log("RabbitMQ connection established.");
    }

    if (!channel) {
        channel = await connection.createChannel();
        console.log("RabbitMQ channel created.");
    }

    process.on("SIGINT", async () => {
        try {
            if (connection) await connection.close();
            console.log("RabbitMQ connection closed.");
            process.exit(0);
        } catch (err) {
            console.error("Error closing RabbitMQ connection:", err);
            process.exit(1);
        }
    });

    return { connection, channel };
}

// Send a message to a queue and wait for a response
export async function fetchDataFromQueue(queue: string, message: any): Promise<any> {
    const { channel } = await createChannel();
    const correlationId = generateUuid();
    const replyQueue = await channel.assertQueue("", { exclusive: true });

    return new Promise((resolve, reject) => {
        let resolved = false;

        // Set timeout to reject if no response
        const timeout = setTimeout(() => {
            if (!resolved) {
                console.error(`Timeout waiting for response from queue: ${queue}`);
                reject(new Error(`Timeout waiting for response from queue: ${queue}`));
            }
        }, 10000); // 10 seconds timeout

        // Listen for response in the reply queue
        channel.consume(
            replyQueue.queue,
            (msg) => {
                if (msg?.properties.correlationId === correlationId) {
                    resolved = true;
                    clearTimeout(timeout);
                    const response = JSON.parse(msg.content.toString());
                    resolve(response);

                    // Cleanup: cancel the consumer and delete the reply queue
                    channel.cancel(msg.fields.consumerTag).catch((err) =>
                        console.error("Error canceling consumer:", err)
                    );
                    channel.deleteQueue(replyQueue.queue).catch((err) =>
                        console.error("Error deleting reply queue:", err)
                    );
                }
            },
            { noAck: true }
        );

        // Send the message to the queue
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            replyTo: replyQueue.queue,
            correlationId,
        });
    });
}

// Generate a unique ID for correlation
function generateUuid(): string {
    return `${Math.random().toString(36).substring(2)}-${Math.random().toString(36).substring(2)}`;
}
