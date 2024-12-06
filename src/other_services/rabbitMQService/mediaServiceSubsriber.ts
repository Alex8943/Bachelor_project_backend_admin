import { Media } from "../model/seqModel"; // Sequelize model for Media

export async function startMediaConsumer(channel: any) {
    const queue = "media-service";

    try {
        await channel.assertQueue(queue, { durable: false });
        console.log(`Listening for messages in ${queue}...`);

        channel.consume(
            queue,
            async (msg: any) => {
                if (msg) {
                    const { mediaId } = JSON.parse(msg.content.toString());
                    console.log(`Received request for mediaId: ${mediaId}`);

                    try {
                        console.log("Looking for Media with ID:", mediaId);

                        const media = await Media.findByPk(mediaId);

                        if (media) {
                            console.log("Media found:", media.toJSON());
                            channel.sendToQueue(
                                msg.properties.replyTo,
                                Buffer.from(JSON.stringify(media)),
                                { correlationId: msg.properties.correlationId }
                            );
                        } else {
                            console.log(`Media with ID ${mediaId} not found in the database.`);
                            const errorResponse = { error: `Media with ID ${mediaId} not found` };
                            channel.sendToQueue(
                                msg.properties.replyTo,
                                Buffer.from(JSON.stringify(errorResponse)),
                                { correlationId: msg.properties.correlationId }
                            );
                        }
                    } catch (error) {
                        console.error("Error querying Media:", error);
                    }

                    // Acknowledge the message
                    channel.ack(msg);
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error("Error setting up media consumer:", error);
    }
}
