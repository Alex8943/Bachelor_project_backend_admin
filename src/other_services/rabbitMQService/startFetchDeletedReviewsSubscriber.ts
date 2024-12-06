import { Review } from "../model/seqModel"; // Sequelize model for reviews

export async function startFetchDeletedReviewsConsumer(channel: any) {
    const queue = "soft-deleted-reviews-service";

    try {
        await channel.assertQueue(queue, { durable: false });
        console.log(`Listening for messages in ${queue}...`);

        channel.consume(
            queue,
            async (msg: any) => {
                if (msg) {
                    console.log("Received request for fetching all soft-deleted reviews...");

                    try {
                        const reviews = await Review.findAll({ where: { isBlocked: true } });
                        console.log("Fetched soft-deleted reviews:", reviews);

                        // Send data back via RabbitMQ
                        channel.sendToQueue(
                            msg.properties.replyTo,
                            Buffer.from(JSON.stringify(reviews)),
                            { correlationId: msg.properties.correlationId }
                        );
                        console.log("Soft-deleted reviews sent back.");
                    } catch (error) {
                        console.error("Error fetching soft-deleted reviews:", error);
                    }

                    channel.ack(msg); // Acknowledge the message
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error("Error setting up soft-deleted reviews consumer:", error);
    }
}
