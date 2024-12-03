import express from "express";

const router = express.Router();
const clients: any[] = []; // Store active SSE connections

// Function to send events to all connected clients
const sendEventToClients = (event: any) => {
  clients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify(event)}\n\n`);
  });
};

router.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Keep the connection open
  res.flushHeaders();

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

// Function to broadcast RabbitMQ events
const broadcastNewUserEvent = (user: any) => {
  sendEventToClients({
    event: "signup",
    user, // Real user data
    timestamp: new Date().toISOString(),
  });
};

export { router as sseRouter, broadcastNewUserEvent };
