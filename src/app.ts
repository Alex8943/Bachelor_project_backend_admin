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
import cors from 'cors';


const app = express();

app.use(cors());

//testDBConnection();
//dump;

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

app.listen(3000, () => {
    console.log('Server is running on localhost:3000');
});

