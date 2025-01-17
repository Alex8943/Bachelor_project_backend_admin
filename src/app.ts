import express from 'express';
import { testDBConnection } from './db_services/local/db_connection';
import { deployed_testDBConnection } from './db_services/deployed/db_connection';
//import { seedData } from './db_services/seed_data/database1/seed_data';
//import { seedData2 } from './db_services/seed_data/database2/seed_data';
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


//seedData();
//seedData2();
//createBackup();

const app = express();
app.use(cors()); 

app.use(sseRouter);
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
    await initializeConsumers();
    console.log('Admin server is running on localhost:3000');
});

