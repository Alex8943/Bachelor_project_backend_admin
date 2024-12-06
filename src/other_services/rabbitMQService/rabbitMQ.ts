import amqp from "amqplib";

const RABBITMQ_URL = "amqp://127.0.0.1"; // Update if RabbitMQ is hosted remotely

export async function createChannel() {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    process.on("SIGINT", async () => {
        try {
            await connection.close();
            console.log("RabbitMQ connection closed.");
            process.exit(0);
        } catch (err) {
            console.error("Error closing RabbitMQ connection:", err);
            process.exit(1);
        }
    });
    
    return { connection, channel };
}




