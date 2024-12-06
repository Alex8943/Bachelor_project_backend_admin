

export async function startUndeleteReviewConsumer(channel: any) {
    const queue = "undelete-review-service";

    try {
        await channel.assertQueue(queue, { durable: false });
        console.log(`Listening for messages in ${queue}...`);

        channel.consume(
            queue,
            async (msg: any) => {
                if (msg) {
                    const { reviewId } = JSON.parse(msg.content.toString());
                    console.log(`Received request to undelete review with ID: ${reviewId}`);

                    try {
                        // Simulate or perform undelete operation here
                        console.log(`Undelete operation for review ID ${reviewId} acknowledged.`);
                    } catch (error) {
                        console.error(`Error processing undelete for review ID ${reviewId}:`, error);
                    }

                    // Acknowledge the message
                    channel.ack(msg);
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error("Error setting up undelete-review consumer:", error);
    }
}
