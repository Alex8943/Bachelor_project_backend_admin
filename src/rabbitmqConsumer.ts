import amqp from "amqplib";
import { broadcastNewUserEvent } from "./routes/updateRouter"; // Import the broadcast function
import { startUserConsumer } from "./other_services/rabbitMQService/userServiceSubsriber";
import { startGenreConsumer } from "./other_services/rabbitMQService/genreServiceSubsriber";
import { startMediaConsumer } from "./other_services/rabbitMQService/mediaServiceSubsriber";
import { startReviewGenresConsumer } from "./other_services/rabbitMQService/reviewGenreSubscriber";
import { startDeleteReviewConsumer } from "./other_services/rabbitMQService/deleteReviewSubscriber";


const RABBITMQ_URL = "amqp://localhost";
const QUEUE_NAME = "authentication queue";


export const initializeConsumers = async () => {
  try {
      console.log("Initializing RabbitMQ Consumers...");

      // Initialize all RabbitMQ consumers
      await Promise.all([
          startUserConsumer(),
          startGenreConsumer(),
          startMediaConsumer(),
      ]);

      console.log("All RabbitMQ Consumers are up and running.");
  } catch (error) {
      console.error("Error initializing RabbitMQ Consumers:", error);
  }
};

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



(async () => {
  try {
      console.log("Initializing RabbitMQ Consumers...");
      await startReviewGenresConsumer(); // Start the ReviewGenres consumer
      console.log("RabbitMQ Consumers are up and running.");
  } catch (error) {
      console.error("Error initializing RabbitMQ consumers:", error);
  }
})();

(async () => {
  // Start RabbitMQ consumers
  await startDeleteReviewConsumer();
  console.log("RabbitMQ Consumers are up and running.");
})();


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
