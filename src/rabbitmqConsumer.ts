import amqp from "amqplib";
import { broadcastNewUserEvent } from "./routes/updateRouter"; // Import the broadcast function
import { startUserConsumer } from "./other_services/rabbitMQService/userServiceSubsriber";
import { startGenreConsumer } from "./other_services/rabbitMQService/genreServiceSubsriber";
import { startMediaConsumer } from "./other_services/rabbitMQService/mediaServiceSubsriber";
import { startReviewGenresConsumer } from "./other_services/rabbitMQService/reviewGenreSubscriber";
import { startDeleteReviewConsumer } from "./other_services/rabbitMQService/deleteReviewSubscriber";
import { startUndeleteReviewConsumer } from "./other_services/rabbitMQService/undeleteReviewSubscriber";
import { startFetchDeletedReviewsConsumer } from "./other_services/rabbitMQService/startFetchDeletedReviewsSubscriber";
import { startSearchReviewConsumer } from "./other_services/rabbitMQService/searchReviewSubscriber";


const RABBITMQ_URL = "amqp://localhost";
const QUEUE_NAME = "authentication queue";

export const initializeConsumers = async () => {
  try {
    console.log("Initializing RabbitMQ Consumers...");

    // Create a single connection and channel for all consumers
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Initialize all RabbitMQ consumers with the shared channel
    await Promise.all([
      startUserConsumer(channel),
      startGenreConsumer(channel),
      startMediaConsumer(channel),
      startReviewGenresConsumer(channel),
      startDeleteReviewConsumer(channel),
      startUndeleteReviewConsumer(channel),
      startFetchDeletedReviewsConsumer(channel),
      startSearchReviewConsumer(channel),
    ]);

    console.log("All RabbitMQ Consumers are up and running.");

    process.on("SIGINT", async () => {
      try {
          console.log("Closing RabbitMQ connection gracefully...");
          await channel.close(); // Close the shared channel
          await connection.close(); // Close the shared connection
          console.log("RabbitMQ connection closed.");
          process.exit(0); // Exit the process after cleanup
      } catch (error) {
          console.error("Error closing RabbitMQ connection:", error);
          process.exit(1);
      }
  });
  
  } catch (error) {
    console.error("Error initializing RabbitMQ Consumers:", error);
  }
};

// Example consumer for the authentication queue
export const initializeAuthenticationConsumer = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`Consumer listening to queue: ${QUEUE_NAME}`);

    // Listen for messages in the authentication queue
    channel.consume(
      QUEUE_NAME,
      (message) => {
        if (message) {
          const userData = JSON.parse(message.content.toString());
          console.log("New user data received from RabbitMQ:", userData);

          // Broadcast the user data to connected SSE clients
          broadcastNewUserEvent(userData);

          // Process the message
          processMessage(userData);

          // Acknowledge the message
          channel.ack(message);
        }
      },
      { noAck: false }
    );

    // Handle graceful shutdown for this connection
    process.on("SIGINT", async () => {
      try {
        await connection.close();
        console.log("RabbitMQ connection closed for authentication queue.");
        process.exit(0);
      } catch (err) {
        console.error("Error closing RabbitMQ connection for authentication queue:", err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Error initializing RabbitMQ consumer for authentication queue:", error);
  }
};

// Message processing logic
const processMessage = (message: any) => {
  try {
    console.log("Processing message:", message);

    // Check if the message is login or signup
    if (message.event === "login" || message.event === "signup") {
      console.log("Message from the publisher: ", message.event);
    } else {
      console.log("Message type not recognized");
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
};
