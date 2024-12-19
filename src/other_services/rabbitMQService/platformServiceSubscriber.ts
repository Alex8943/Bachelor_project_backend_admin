import { Platform } from "../model/seqModel"; // Sequelize model for Platform

export async function startPlatformServiceSubscriber(channel: any) {
    const queue = "platform-service";

    try {
        // Ensure the queue exists
        await channel.assertQueue(queue, { durable: false });
        console.log(`Listening for messages in ${queue}...`);

        channel.consume(
            queue,
            async (msg: any) => {
                if (msg) {
                    const { platformId } = JSON.parse(msg.content.toString());
                    console.log(`Received request for platformId: ${platformId}`);

                    try {
                        // Fetch platform data from Database 1
                        const platform = await Platform.findByPk(platformId);

                        if (platform) {
                            console.log(`Platform data found:`, platform.toJSON());
                        } else {
                            console.log(`Platform with ID ${platformId} not found.`);
                        }

                        // Send response back to the requester
                        channel.sendToQueue(
                            msg.properties.replyTo, // Reply queue
                            Buffer.from(JSON.stringify(platform || { error: `Platform with ID ${platformId} not found` })), // Platform data or error
                            { correlationId: msg.properties.correlationId } // Match request-response
                        );

                        console.log(`Platform data sent back for platformId: ${platformId}`);
                    } catch (error) {
                        console.error("Error fetching platform data:", error);
                    }

                    // Acknowledge the message
                    channel.ack(msg);
                }
            },
            { noAck: false } // Ensure message acknowledgment
        );
    } catch (error) {
        console.error("Error setting up platform service subscriber:", error);
    }
}
