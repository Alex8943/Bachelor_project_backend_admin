import request from 'supertest';
import sequelize from '../other_services/sequelizeConnection'; 
import { testDBConnection } from '../db_services/local/db_connection';
import { test_DB2_connection } from '../db_services/local/db2_connection';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { error } from 'console';

dotenv.config();

describe("Test db connections", () => {
    it("is testing db connection", async () => {
        await testDBConnection();
        expect(testDBConnection).toBeDefined();
        expect(testDBConnection).toBeInstanceOf(Function);

        const database1Name = process.env.dev_database 
        const database2Name = process.env.dev_database2
        
        expect(database1Name).toBeDefined();
        expect(database2Name).toBeDefined();

        expect(database1Name).toBe("stohtpsd_company")
        expect(database2Name).toBe("stohtpsd_reviews")

        process.env.dev_database = "wrong_db";
        await testDBConnection().catch((error) => {
            expect(error).toBeInstanceOf(Error);
        });

        
    });

    it("Should test db2 connection", async () => {
        await test_DB2_connection();
        expect(test_DB2_connection).toBeDefined();
        expect(test_DB2_connection).toBeInstanceOf(Function);
        
        //Force an error to test the catch block
        process.env.dev_host2 = "wrong_host";
        process.env.dev_user2 = "wrong",

        await test_DB2_connection().catch((error) => {
            expect(error).toBeInstanceOf(Error);
        });
        
    });

    it("Should test sequelize connection", async () => {
        await sequelize.authenticate()
            .then(() => console.log('Connection has been established successfully.'))
            .catch((error) => console.error('Unable to connect to the database:', error));
        expect(sequelize.authenticate).toBeDefined();
    });
    
});


