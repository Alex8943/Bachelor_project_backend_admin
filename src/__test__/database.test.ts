import request from 'supertest';
import sequelize from '../other_services/sequelizeConnection'; 
import { testDBConnection } from '../db_services/db_connection';
import { test_DB2_connection } from '../db_services/db2_connection';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { error } from 'console';

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
        

    
});

