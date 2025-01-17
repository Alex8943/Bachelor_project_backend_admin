import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

dotenv.config();

describe('my local database connection test', () => {
    let connection: any = null;
    let connection2: any = null;

    beforeAll(async () => {
        const mysqlConfig = {
            host: process.env.dev_host,
            user: process.env.dev_user,
            password: process.env.dev_password,
            database: process.env.dev_database,
        };

        connection = await mysql.createConnection(mysqlConfig);

        const mysqlConfig2 = {
            host: process.env.dev_host2, // Corrected key names
            user: process.env.dev_user2, // Corrected key names
            password: process.env.dev_password2, // Corrected key names
            database: process.env.dev_database2, // Corrected key names
        };

        connection2 = await mysql.createConnection(mysqlConfig2);
    });

    test('should connect to local database 1', async () => {
        try {
            const [rows] = await connection.execute('SELECT DATABASE() AS databaseName');
            const databaseName = rows[0].databaseName;

            expect(databaseName).toBe('podcasts_review');
        } catch (err) {
            console.error(err);
        }
    });

    test('should connect to local database 2', async () => {
        try {
            const [rows] = await connection2.execute('SELECT DATABASE() AS databaseName');
            const databaseName = rows[0].databaseName;

            expect(databaseName).toBe('stohtpsd_reviews'); // Simplified the expectation
        } catch (err) {
            console.error(err);
        }
    });

    test("Should fetch all users from the first database", async () => {
        try {
            const [rows] = await connection.execute('SELECT * FROM user');
            expect(rows.length).toBeGreaterThan(0);
            expect(rows.length).toBeGreaterThan(200);
        } catch (err) {
            console.error(err);
        }
    });

    test("Should fetch all reviews from second database", async () => {
        try {
            const [rows] = await connection2.execute('SELECT * FROM reviews');
            expect(rows.length).toBeGreaterThan(0);
            expect(rows.length).toBeGreaterThan(200);
        } catch (err) {
            console.error(err);
        }
    });

    afterAll(async () => {
        await connection.end();
        await connection2.end();
    });
});
