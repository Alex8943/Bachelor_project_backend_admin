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
import { startUpdateReviewSubscriber } from "./other_services/rabbitMQService/updateReviewSubscriber";
import { startFetchOneReviewById } from "./other_services/rabbitMQService/fetchReviewByIdSubscriber";
import { startPlatformServiceSubscriber } from "./other_services/rabbitMQService/platformServiceSubscriber";
import dotenv from "dotenv";


dotenv.config();

const LOCAL_RABBITMQ_URL = process.env.rabbitmq_port || "amqp://localhost";
if (!LOCAL_RABBITMQ_URL) {
  throw new Error("RabbitMQ URL is not provided");
}

console.log("RabbitMQ URL:", LOCAL_RABBITMQ_URL); 
const AUTH_QUEUE_NAME = "authentication queue";

export const initializeConsumers = async () => {
  try {
    console.log("Initializing RabbitMQ Consumers...");

    // Create a single connection and channel for all consumers
    const connection = await amqp.connect(LOCAL_RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    // Assert the authentication queue
    await channel.assertQueue(AUTH_QUEUE_NAME, { durable: true });

    // Start all service consumers (with shared channel)
    await Promise.all([
      startUserConsumer(channel),
      startGenreConsumer(channel),
      startMediaConsumer(channel),
      //startReviewGenresConsumer(channel),
      //startDeleteReviewConsumer(channel),
      //startUndeleteReviewConsumer(channel),
      //startFetchDeletedReviewsConsumer(channel),
      //startSearchReviewConsumer(channel),
      //startUpdateReviewSubscriber(channel),
      //startFetchOneReviewById(channel),
      //startPlatformServiceSubscriber(channel),
      startAuthenticationConsumer(channel),  // Add auth consumer
    ]);

    console.log("All RabbitMQ Consumers are up and running.");

    // Graceful shutdown (single handler for all)
    process.on("SIGINT", async () => {
      try {
        console.log("Closing RabbitMQ connection gracefully...");
        await channel.close();
        await connection.close();
        console.log("RabbitMQ connection closed.");
        process.exit(0);
      } catch (error) {
        console.error("Error closing RabbitMQ connection:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Error initializing RabbitMQ Consumers:", error);
  }
};

// Authentication Consumer (Revised)
const startAuthenticationConsumer = async (channel: amqp.Channel) => {
  try {
    console.log(`Listening for messages on queue: ${AUTH_QUEUE_NAME}`);
      
    channel.consume(
      AUTH_QUEUE_NAME,
      (message) => {
        if (message) {
          const receivedData = JSON.parse(message.content.toString());
          console.log("New user data received from RabbitMQ:", receivedData);
    
          const userData = receivedData.authToken?.user || receivedData;
          console.log("Processed user data:", userData);
    
          // Process message (Check for login/signup)
          processMessage(receivedData);  // <-- Call processMessage here
    
          // Broadcast to SSE clients
          broadcastNewUserEvent(userData);
          channel.ack(message);
        }
      },
      { noAck: false }
    );
    
    
      
  } catch (error) {
    console.error("Error initializing authentication consumer:", error);
  }
};

// Message processing logic
const processMessage = (message: any) => {
  try {
    console.log("Processing message:", message);

    // Check if the message is login or signup
    if (message.event === "login" || message.event === "signup") {
      console.log("Message from publisher:", message.event);
    } else {
      console.log("Message type not recognized");
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
};



