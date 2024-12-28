import express from "express";
import verifyUser from "./authenticateUser";

const router = express.Router();
const clients: any[] = []; // Store active SSE connections


const sendEventToClients = (event: any) => {
  clients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify(event)}\n\n`);
  });
};

router.get("/sse", (req, res) => {
  /*res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  */

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Keep the connection open
  //res.flushHeaders();

  // Add the client to the list
  const clientId = Date.now();
  clients.push({ id: clientId, res });

  console.log(`Client connected: ${clientId}`);

  // Remove the client on connection close
  req.on("close", () => {
    console.log(`Client disconnected: ${clientId}`);
    clients.splice(
      clients.findIndex((client) => client.id === clientId),
      1
    );
  });
});

// broadcast RabbitMQ events
const broadcastNewUserEvent = (user: any) => {
  sendEventToClients({
    event: "signup",
    user: {
      name: user.name,
      email: user.email,
    },
    timestamp: new Date().toISOString(),
  });
};


export { router as sseRouter, broadcastNewUserEvent };
