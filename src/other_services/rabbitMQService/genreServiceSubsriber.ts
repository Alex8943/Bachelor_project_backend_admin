import { Genre, Review } from "../model/seqModel"; // Sequelize model for Genre

export async function startGenreConsumer(channel: any) {
    const queue = "genre-service";

    try {
        await channel.assertQueue(queue, { durable: false });
        console.log(`Listening for messages in ${queue}...`);

        channel.consume(
            queue,
            async (msg: any) => {
                if (msg) {
                    const { reviewId } = JSON.parse(msg.content.toString());
                    console.log(`Received request for reviewId: ${reviewId}`);

                    try {
                        // Fetch genres related to the review ID
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

                        // Send the fetched genres back to RabbitMQ
                        channel.sendToQueue(
                            msg.properties.replyTo,
                            Buffer.from(JSON.stringify(genres)),
                            { correlationId: msg.properties.correlationId }
                        );

                        console.log("Genres sent back:", genres);
                    } catch (error) {
                        console.error("Error fetching genre data:", error);
                    }

                    // Acknowledge the message
                    channel.ack(msg);
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error("Error setting up genre consumer:", error);
    }
}
