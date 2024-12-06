import { createChannel } from "./rabbitMQ"; // Ensure the shared connection logic is imported
import { Review } from "../model/seqModel"; // Sequelize model for reviews
import { Op } from "sequelize";

export async function startSearchReviewConsumer(channel: any) {
    
    const queue = "search-review-service";

    try {
        await channel.assertQueue(queue, { durable: false });
        console.log(`Listening for messages in ${queue}...`);

        channel.consume(
            queue,
            async (msg: any) => {
                if (msg) {
                    const { title } = JSON.parse(msg.content.toString());
                    console.log(`Received request to search reviews by title: "${title}"`);

                    try {
                        // Search reviews by title
                        const reviews = await Review.findAll({
                            where: {
                                title: {
                                    [Op.like]: `%${title}%`, // Sequelize "like" query
                                },
                            },
                        });

                        console.log(`Found reviews matching title "${title}":`, reviews);

                        // Send the data back through RabbitMQ
                        channel.sendToQueue(
                            msg.properties.replyTo,
                            Buffer.from(JSON.stringify(reviews)),
                            { correlationId: msg.properties.correlationId }
                        );
                    } catch (error) {
                        console.error("Error searching reviews by title:", error);
                    }

                    // Acknowledge the message
                    channel.ack(msg);
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error("Error setting up search-review consumer:", error);
    }
}
