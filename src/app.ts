import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRouter';
import genreRouter from './routes/genreRouter';
import actionRouter from './routes/reviewActionRouter';
import userRouter from './routes/userRouter';
import roleRouter from './routes/roleRouter';
import { sseRouter, broadcastNewUserEvent } from './routes/updateRouter'; // SSE Router
import {initializeConsumers} from './rabbitmqConsumer'; // RabbitMQ Consumer
import logger from './other_services/winstonLogger';
import { test_DB2_connection } from './db_services/db2_connection';
import { testDBConnection } from './db_services/db_connection';
import { seedData } from '../seed_data';
import createBackup from './db_services/backup';

import {config} from '../config';

//test_DB2_connection();
//testDBConnection();
//seedData();
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
