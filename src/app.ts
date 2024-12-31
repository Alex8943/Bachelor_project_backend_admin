import express from 'express';
import { test_DB2_connection } from './db_services/local/db2_connection';
import { testDBConnection } from './db_services/local/db_connection';
import { deployed_testDBConnection } from './db_services/deployed/db_connection';
import { deployed_test_DB2_connection } from './db_services/deployed/db2_connection';
//import { seedData } from '../seed_data';
import { seedData2 } from './db_services/seed_data/database2(reviews)/seed_data2'
import createBackup from './db_services/backup';
import cors from 'cors';
import authRouter from './routes/authRouter';
import genreRouter from './routes/genreRouter';
import actionRouter from './routes/reviewActionRouter';
import userRouter from './routes/userRouter';
import roleRouter from './routes/roleRouter';
import { sseRouter } from './routes/updateRouter'; // SSE Router
import {initializeConsumers } from './rabbitmqConsumer'; // RabbitMQ Consumer
import logger from './other_services/winstonLogger';

//test_DB2_connection();
//testDBConnection();

//deployed_testDBConnection();
//deployed_test_DB2_connection();

//seedData();
//seedData2();
//createBackup();

const app = express();
app.use(cors());

// Enable CORS for all routes
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your frontend
    credentials: true,
  })
);

app.use("/sse", sseRouter);
app.use(authRouter);
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
    //await initializeConsumers();
    console.log('Admin server is running on localhost:3000');
});
