import { createChannel } from "./rabbitMQ";
import logger from "../../other_services/winstonLogger";

const queueName = "review-update-service";

export const startUpdateReviewSubscriber = async (channel: any) => {
    try {
        

        await channel.assertQueue(queueName, { durable: true });
        console.log(`Listening for messages in ${queueName}...`);

        channel.consume(queueName, async (msg: any) => {
            if (msg) {
                const content = JSON.parse(msg.content.toString());

                try {
                    // Process the message
                    if (content.event === "review_updated") {
                        console.log(`Received update review message for reviewId: ${content.reviewId}`);
                        
                    }
                } catch (error) {
                    logger.error(`Error processing message: ${error}`);
                } finally {
                    channel.ack(msg);
                }
            }
        });
    } catch (error) {
        console.log("Error starting updateReview subscriber:", error);
    }
};
