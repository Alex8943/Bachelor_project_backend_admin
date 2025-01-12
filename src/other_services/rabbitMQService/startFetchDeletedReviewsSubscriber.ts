import { Review } from "../model/seqModel"; // Sequelize model for reviews
import { fetchDataFromQueue } from "./rabbitMQ"; // Function to fetch data from RabbitMQ

export async function startFetchDeletedReviewsConsumer(channel: any) {
    const queue = "soft-deleted-reviews-service";

        await channel.assertQueue(queue, { durable: false });
        console.log(`Listening for messages in ${queue}...`);

        channel.consume(
            queue,
            async (msg: any) => {
                if (msg) {
                    console.log("Received request for fetching all soft-deleted reviews...");
                        // Fetch soft-deleted reviews from the database
                        const reviews = await Review.findAll({ where: { isBlocked: true } });

                        // Enrich reviews with user data
                        const enrichedReviews = await Promise.all(
                            reviews.map(async (review) => {
                                try {
                                    const user = await fetchDataFromQueue("user-service", { userId: review.user_fk });
                                    return {
                                        id: review.id,
                                        title: review.title,
                                        description: review.description,
                                        user: user || { error: `User not found for ID ${review.user_fk}` },
                                        createdAt: review.createdAt,
                                        updatedAt: review.updatedAt,
                                    };
                                } catch (error) {
                                    console.error(`Error fetching user for review ID ${review.id}:`, error);
                                }
                            })
                        );
                        

                        // Send enriched reviews back via RabbitMQ
                        channel.sendToQueue(
                            msg.properties.replyTo,
                            Buffer.from(JSON.stringify(enrichedReviews)),
                            { correlationId: msg.properties.correlationId }
                        );
                        console.log("Soft-deleted reviews sent back.");

                    channel.ack(msg); // Acknowledge the message
                }
            },
            { noAck: false }
        );
    }
