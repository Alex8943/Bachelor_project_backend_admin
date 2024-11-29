import amqp from "amqplib";

const RABBITMQ_URL = "amqp://localhost"; // Update with credentials if necessary
const QUEUE_NAME = "authentication queue";

export const initializeConsumer = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true }); // Ensure the queue exists

    console.log(`Consumer listening to queue: ${QUEUE_NAME}`);

    // Start consuming messages
    channel.consume(
      QUEUE_NAME,
      (message) => {
        if (message) {
          const content = message.content.toString();
          console.log(`Message received from queue: ${content}`);

          // Acknowledge the message
          channel.ack(message);

          // Process the message
          processMessage(JSON.parse(content));
        }
      },
      { noAck: false } // Messages must be acknowledged
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error initializing RabbitMQ consumer:", error.message);
    } else {
      console.error("Error initializing RabbitMQ consumer:", error);
    }
  }
};

// Message processing logic
const processMessage = (message: any) => {
  console.log("Processing message:", message);

  //Tjeck if the message is login 
    if (message.event === "login") {
        console.log("Message from the publisher: ", message.event);
    }else{
        console.log("Message type not recognized");
    }
};
