import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import exp from 'constants';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.prod_host,
    user: process.env.prod_user,
    password: process.env.prod_password,
    database: process.env.prod_database,
    ssl: { rejectUnauthorized: true }
});

export async function deployed_testDBConnection() {
    const connection = await pool.getConnection();
    try {
        await connection.ping();
        console.log(`Connected to mysql database name: ${process.env.prod_database}`);
    }
    catch (err) {
        console.log("Could not connect to mysql database");
        console.error(err);
        process.exit(1);
    } finally {
        connection.release();
    }
}

export default pool;