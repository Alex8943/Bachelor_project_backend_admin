import express from 'express';
import { testDBConnection } from "./db_services/db_connection";
import dump from "./db_services/backup";
import logger from "./other_services/winstonLogger";
import authRouter from "./routes/authRouter";
import reviewRouter from "./routes/reviewRouter";
import genreRouter from "./routes/genreRouter";
import actionRouter from "./routes/actionRouter";
import userRouter from "./routes/userRouter";
import roleRouter from "./routes/roleRouter";
import {seedData} from "../seed_data";
import { initializeConsumer } from "./rabbitmqConsumer"; // RabbitMQ Consumer
import { sseRouter } from "./routes/updateRouter"; // SSE Router

import cors from 'cors';



const app = express();

app.use(cors());

//testDBConnection();
//dump;

//seedData();

app.use(
    cors({
      origin: "http://localhost:5173", // Allow requests from the Admin Frontend
      methods: ["GET"], // Limit to methods required for SSE
      allowedHeaders: ["Content-Type"], // Allow necessary headers
      credentials: true, // Allow credentials if needed
    })
  );

app.use("/sse", sseRouter);

app.use(authRouter);
app.use(reviewRouter);
app.use(genreRouter);
app.use(actionRouter);
app.use(userRouter);
app.use(roleRouter);




process.on('SIGINT', () => {
    logger.end(); 
    console.log('See ya later silly');
    process.exit(0);
});

app.listen(3000, async () => {
    await initializeConsumer();
    console.log('Admin server is running on localhost:3000');
});

