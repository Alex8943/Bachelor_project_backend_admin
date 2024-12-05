import { createChannel } from "./rabbitMQ";
import { Review } from "../model/seqModel"; // Adjust path to your Sequelize model
import sequelize from "../sequelizeConnection";

export async function startDeleteReviewConsumer() {
    const { channel, connection } = await createChannel();
    const queue = "delete-review-service";

    try {
        await channel.assertQueue(queue, { durable: false });
        console.log(`Listening for messages in ${queue}...`);

        channel.consume(
            queue,
            async (msg) => {
                if (msg) {
                    const { reviewId } = JSON.parse(msg.content.toString());
                    console.log(`Received request to soft delete review with ID: ${reviewId}`);

                    // Log or handle the message (e.g., for analytics or notifications)
                    console.log(`Soft delete for review ID ${reviewId} acknowledged.`);

                    // Acknowledge the message
                    channel.ack(msg);
                }
            }
        );
    } catch (error) {
        console.error("Error setting up delete-review consumer:", error);
        connection.close();
    }
}
