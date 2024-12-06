import { Review } from "../model/seqModel"; // Adjust path to your Sequelize model

let isClosing = false; // Flag to manage graceful shutdown

export async function startDeleteReviewConsumer(channel: any) {
    const queue = "delete-review-service";

    try {
        await channel.assertQueue(queue, { durable: false });
        console.log(`Listening for messages in ${queue}...`);

        channel.consume(
            queue,
            async (msg: any) => {
                if (msg) {
                    const { reviewId } = JSON.parse(msg.content.toString());
                    console.log(`Received request to soft delete review with ID: ${reviewId}`);

                    try {
                        // Soft delete the review in the database
                        await Review.update(
                            { isBlocked: true },
                            { where: { id: reviewId } }
                        );
                        console.log(`Soft delete for review ID ${reviewId} acknowledged.`);
                    } catch (error) {
                        console.error(`Error during soft delete for review ID ${reviewId}:`, error);
                    }

                    // Acknowledge the message
                    channel.ack(msg);
                }
            },
            { noAck: false }
        );

    
    } catch (error) {
        console.error("Error setting up delete-review consumer:", error);
        // Ensure cleanup in case of errors
        if (channel) await channel.close();
    }
}
