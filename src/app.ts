import express from 'express';
import { testDBConnection } from "./db_services/db_connection";
import dump from "./db_services/backup";
import logger from "./other_services/winstonLogger";
import authRouter from "./routes/authRouter";

const app = express();

//testDBConnection();
dump;

app.use(authRouter);




process.on('SIGINT', (code) => {
    logger.end(); 
    console.log('See ya later silly');
    process.exit(0);
});

app.listen(3000, () => {
    console.log('Server is running on localhost:3000');
});



