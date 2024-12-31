import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.dev_host2,
    user: process.env.dev_user2,
    password: process.env.dev_password2,
    database: process.env.dev_database2,
    ssl: { rejectUnauthorized: true }
});

export async function deployed_test_DB2_connection() {
    const connection = await pool.getConnection();
    try {
        await connection.ping();
        console.log(`Connected to mysql database name: ${process.env.prod_database2}`);
    }
    catch (err) {
        console.log("Could not connect to mysql database");
        console.error(err);  // Print the error to debug further
        process.exit(1);
    } finally {
        connection.release();  // Always release the connection
    }
}

export default pool;