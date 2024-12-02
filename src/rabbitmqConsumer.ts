import amqp from "amqplib";
import { broadcastNewUserEvent } from "./routes/updateRouter"; // Import the broadcast function

const RABBITMQ_URL = "amqp://localhost";
const QUEUE_NAME = "authentication queue";

export const initializeConsumer = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`Consumer listening to queue: ${QUEUE_NAME}`);

    // Listen for messages in the queue
    channel.consume(
      QUEUE_NAME,
      (message) => {
        if (message) {
          const userData = JSON.parse(message.content.toString());
          console.log("New user data received from RabbitMQ:", userData);

          // Broadcast the user data to connected SSE clients
          broadcastNewUserEvent(userData);
          
          processMessage(userData); // Process the message
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error initializing RabbitMQ consumer:", error);
  }
};

// Message processing logic
const processMessage = (message: any) => {
  console.log("Processing message:", message);

  //Tjeck if the message is login 
    if (message.event === "login" || message.event === "signup") {
        console.log("Message from the publisher: ", message.event);
    }else{
        console.log("Message type not recognized");
    }
};
