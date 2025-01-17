import { ReviewGenres } from "../model/seqModel"; // Sequelize model for `review_genres`

export async function startReviewGenresConsumer(channel: any) {
    const queue = "review-genres-service";

    try {
        await channel.assertQueue(queue, { durable: false });
        console.log(`Listening for messages in ${queue}...`);

        channel.consume(
            queue,
            async (msg: any) => {
                if (msg) {
                    const { reviewId } = JSON.parse(msg.content.toString());
                    console.log(`Received request for review_genres for reviewId: ${reviewId}`);

                    try {
                        // Fetch genres associated with the review ID from database1
                        const reviewGenres = await ReviewGenres.findAll({
                            where: { review_fk: reviewId },
                        });

                        console.log("Fetched review genres:", reviewGenres);

                        // Prepare genres data to send back
                        const genres = reviewGenres.map((rg) => ({
                            review_fk: rg.review_fk,
                            genre_fk: rg.genre_fk,
                        }));

                        // Send the data back through RabbitMQ
                        channel.sendToQueue(
                            msg.properties.replyTo,
                            Buffer.from(JSON.stringify(genres)),
                            { correlationId: msg.properties.correlationId }
                        );
                        console.log(`Genres sent back for reviewId ${reviewId}:`, genres);
                    } catch (error) {
                        console.error("Error fetching review genres data:", error);
                    }

                    // Acknowledge the message
                    channel.ack(msg);
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error("Error setting up review-genres consumer:", error);
    }
}
