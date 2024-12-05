import { createChannel } from "./rabbitMQ";

export async function startUndeleteReviewConsumer() {
    const { channel, connection } = await createChannel();
    const queue = "undelete-review-service";

    try {
        await channel.assertQueue(queue, { durable: false });
        console.log(`Listening for messages in ${queue}...`);

        channel.consume(
            queue,
            async (msg) => {
                if (msg) {
                    const { reviewId } = JSON.parse(msg.content.toString());
                    console.log(`Received request to undelete review with ID: ${reviewId}`);

                    // Log or handle the message (e.g., for analytics or notifications)
                    console.log(`Undelete for review ID ${reviewId} acknowledged.`);

                    // Acknowledge the message
                    channel.ack(msg);
                }
            }
        );
    } catch (error) {
        console.error("Error setting up undelete-review consumer:", error);
        connection.close();
    }
}