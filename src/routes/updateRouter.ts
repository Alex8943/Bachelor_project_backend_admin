import express from "express";
import verifyUser from "./authenticateUser";

const router = express.Router();
const clients: any[] = []; // Store active SSE connections


const sendEventToClients = (event: any) => {
  console.log(`Broadcasting event to ${clients.length} clients:`, event);
  clients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify(event)}\n\n`);
  });
};

setInterval(() => {
  clients.forEach((client) => {
    client.res.write(`event: ping\ndata: {}\n\n`); // Sends a "ping" event
  });
}, 15000); // Every 15 seconds

router.get("/sse/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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



// Broadcast RabbitMQ events dynamically
const broadcastNewUserEvent = (message: any) => {
  const eventType = message.event === "login" ? "login" : "signup";

  sendEventToClients({
    event: eventType,
    user: {
      name: message.name, 
      email: message.email
    },
    timestamp: new Date().toISOString(),
  });

  console.log(`Message from publisher: ${eventType}`);
};




export { router as sseRouter, broadcastNewUserEvent };
