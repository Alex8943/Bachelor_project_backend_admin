import express from 'express';
import { testDBConnection } from "./db_services/db_connection";
import dump from "./db_services/backup";

const app = express();


//testDBConnection();
//dump;



app.listen(3000, () => {
    console.log('Server is running on localhost:3000');
});



