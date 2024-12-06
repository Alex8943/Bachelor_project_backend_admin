import { Review } from "../model/seqModel";

export async function startFetchOneReviewById(channel: any) {
    const queue = "fetch-review-by-id-service";
    try {
        await channel.assertQueue(queue, { durable: false });
        console.log(`Listening for messages in ${queue}...`);

        channel.consume(
            queue,
            async (msg: any) => {
                if (msg) {
                    console.log("Received request for fetching review by ID...");

                    try {
                        const reviewId = JSON.parse(msg.content.toString());
                        const review = await Review.findByPk(reviewId);
                        console.log("Fetched review by ID:", review);

                        // Send data back via RabbitMQ
                        channel.sendToQueue(
                            msg.properties.replyTo,
                            Buffer.from(JSON.stringify(review)),
                            { correlationId: msg.properties.correlationId }
                        );
                        console.log("Review sent back.");
                    } catch (error) {
                        console.error("Error fetching review by ID:", error);
                    }

                    channel.ack(msg); // Acknowledge the message
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error("Error setting up review by ID consumer:", error);
    }
}