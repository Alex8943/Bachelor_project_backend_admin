import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

describe('my local database connection test', () => {

    let connection: any = null;

    let connection2: any = null;

    beforeAll(async () => {
        const mysqlConfig = {
            host: process.env.prod_host,
            user: process.env.prod_user,
            password: process.env.prod_password,
            database: process.env.prod_database,
            port: process.env.prod_port ? parseInt(process.env.prod_port) : 3306,
            ssl: { rejectUnauthorized: true }
        }; 

        connection = await mysql.createConnection(mysqlConfig);

        const mysqlConfig2 = {
            host: process.env.prod_host2,
            user: process.env.prod_user2,
            password: process.env.prod_password2,
            database: process.env.prod_database2,
            port: process.env.prod_port2 ? parseInt(process.env.prod_port2) : 3306,
            ssl: { rejectUnauthorized: true }
        }; 

        connection2 = await mysql.createConnection(mysqlConfig2);
    });

    test('should connect to deployed mysql database', async () => {
        try {
            const [rows] = await connection.execute('SELECT DATABASE() AS databaseName');
            const databaseName = rows[0].databaseName;

            expect(databaseName === 'deployed_stohtpsd_company').toBe(true);
        }catch (err) {
            console.error(err);
        }
    });

    test('should connect to deployed mysql database 2', async () => {
        try {
            const [rows] = await connection2.execute('SELECT DATABASE() AS databaseName');
            const databaseName = rows[0].databaseName;

            expect(databaseName).toBe('deployed_stohtpsd_review');
        }catch (err) {
            console.error(err);
        }
    });

    afterAll(async () => {
        await connection.end();
        await connection2.end();
    });
});