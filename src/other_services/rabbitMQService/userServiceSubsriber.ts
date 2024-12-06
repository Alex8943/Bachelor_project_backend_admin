import { User } from "../model/seqModel"; // Sequelize model for User

export async function startUserConsumer(channel: any) {
    const queue = "user-service";

    try {
        // Ensure the queue exists
        await channel.assertQueue(queue, { durable: false });
        console.log(`Listening for messages in ${queue}...`);

        channel.consume(
            queue,
            async (msg: any) => {
                if (msg) {
                    const { userId } = JSON.parse(msg.content.toString());
                    console.log(`Received request for userId: ${userId}`);

                    try {
                        // Fetch user data from Database 1
                        const user = await User.findByPk(userId);

                        if (user) {
                            console.log(`User data found:`, user.toJSON());
                        } else {
                            console.log(`User with ID ${userId} not found.`);
                        }

                        // Send response back to the requester
                        channel.sendToQueue(
                            msg.properties.replyTo, // Reply queue
                            Buffer.from(JSON.stringify(user || { error: `User with ID ${userId} not found` })), // User data or error
                            { correlationId: msg.properties.correlationId } // Match request-response
                        );

                        console.log(`User data sent back for userId: ${userId}`);
                    } catch (error) {
                        console.error("Error fetching user data:", error);
                    }

                    // Acknowledge the message
                    channel.ack(msg);
                }
            },
            { noAck: false } // Ensure message acknowledgment
        );

    } catch (error) {
        console.error("Error setting up user consumer:", error);
    }
}
