import dotenv from 'dotenv';
import mysql from 'mysql2/promise';


dotenv.config();

const pool = mysql.createPool({
    host: process.env.dev_host2,
    user: process.env.dev_user2,
    password: process.env.dev_password2,
    database: process.env.dev_database2
});

export async function test_DB2_connection() {
    const connection = await pool.getConnection();
    try {
        await connection.ping();
        console.log(`Connected to mysql database name: ${process.env.dev_database2}`);
    }
    catch (err) {
        console.log("Could not connect to mysql database");
        process.exit(1);
    }
}