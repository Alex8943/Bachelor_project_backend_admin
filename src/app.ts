import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRouter';
import reviewRouter from './routes/reviewRouter';
import genreRouter from './routes/genreRouter';
import actionRouter from './routes/actionRouter';
import userRouter from './routes/userRouter';
import roleRouter from './routes/roleRouter';
import { sseRouter } from './routes/updateRouter'; // SSE Router
import { initializeConsumer } from './rabbitmqConsumer'; // RabbitMQ Consumer
import logger from './other_services/winstonLogger';
import {config} from '../config';

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
}));

app.use('/sse', sseRouter);
app.use(authRouter);
app.use(reviewRouter);
app.use(genreRouter);
app.use(actionRouter);
app.use(userRouter);
app.use(roleRouter);

// Export app for testing
export default app;

console.log("DATABASE NAME FROM .ENV: ", config.dbConfig.mysql.mysql_database);

if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', () => {
    logger.end();
    console.log('See ya later silly');
    process.exit(0);
  });

  app.listen(3000, async () => {
    await initializeConsumer();
    console.log('Admin server is running on localhost:3000');
  });
}
