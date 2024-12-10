import request from 'supertest';
import sequelize from '../other_services/sequelizeConnection'; 
import { testDBConnection } from '../db_services/db_connection';
import { test_DB2_connection } from '../db_services/db2_connection';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

describe("Test db connections", () => {
    it("Should test db connection", async () => {
        await testDBConnection();
    });

    it("Should test db2 connection", async () => {
        await test_DB2_connection();
    });

    it("Should test sequelize connection", async () => {
        await sequelize.authenticate()
            .then(() => console.log('Connection has been established successfully.'))
            .catch((error) => console.error('Unable to connect to the database:', error));
    });

    it("Should fail to connect to database1 with wrong credentials", async () => {
        const pool = mysql.createPool({
            host: process.env.dev_host,
            user: process.env.dev_user,
            password: process.env.dev_password,
            database: process.env.dev_database,
        });
        const connection = await pool.getConnection();
        try {
            await connection.ping();
            console.log(`Connected to mysql database name: ${process.env.dev_database}`);
        }
        catch (err) {
            console.log("Could not connect to mysql database");
            process.exit(1);
        }

    });
});

