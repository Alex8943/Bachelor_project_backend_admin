import { createChannel } from "./rabbitMQ";
import { Genre, ReviewGenres, Review } from "../model/seqModel"; // Sequelize model for Genre

export async function startGenreConsumer() {
    const { channel, connection } = await createChannel();
    const queue = "genre-service";

    try {
        await channel.assertQueue(queue, { durable: false });
        console.log(`Listening for messages in ${queue}...`);

        channel.consume(
            queue,
            async (msg) => {
                if (msg) {
                    const { reviewId } = JSON.parse(msg.content.toString());
                    console.log(`Received request for reviewId: ${reviewId}`);

                    try {
                        const genres = await Genre.findAll({
                            include: [
                                {
                                    model: Review,
                                    through: { attributes: [] },
                                    where: { id: reviewId },
                                },
                            ],
                        });
                    
                        console.log("Fetched genres:", genres);
                    
                        // Log the data being sent back to RabbitMQ
                        channel.sendToQueue(
                            msg.properties.replyTo,
                            Buffer.from(JSON.stringify(genres)),
                            { correlationId: msg.properties.correlationId }
                        );
                        console.log("Genres sent back:", genres);
                    } catch (error) {
                        console.error("Error fetching genre data:", error);
                    }
                    channel.ack(msg);
                }
            }
        );
    }
    catch (error) {
        console.error("Error setting up genre consumer:", error);
        connection.close();
    }
}
                    
