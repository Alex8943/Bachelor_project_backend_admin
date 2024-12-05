import { createChannel } from "./rabbitMQ"; // Import createChannel function from rabbitMQ.ts
import { User } from "../model/seqModel"; // Sequelize model for User




export async function startUserConsumer() {

    const { channel, connection } = await createChannel();
    const queue = "user-service";

    try {
        await channel.assertQueue(queue, { durable: false }); // Ensure queue exists

        console.log(`Listening for messages in ${queue}...`);

        channel.consume(
            queue,
            async (msg) => {
                if (msg) {
                    const { userId } = JSON.parse(msg.content.toString());
                    console.log(`Received request for userId: ${userId}`);

                    try {
                        // Fetch user data from Database 1
                        const user = await User.findByPk(userId);

                        // Respond back to review-service
                        channel.sendToQueue(
                            msg.properties.replyTo, // Reply queue
                            Buffer.from(JSON.stringify(user)), // User data
                            { correlationId: msg.properties.correlationId } // Match request-response
                        );

                        console.log(`User data sent back for userId: ${userId}`);
                    } catch (error) {
                        console.error("Error fetching user data:", error);
                    }

                    channel.ack(msg); // Acknowledge the message

                }
            },
            { noAck: false } // Ensure message acknowledgment
        );

       
       
    } catch (error) {
        console.error("Error setting up user consumer:", error);
        connection.close();
    }
}

