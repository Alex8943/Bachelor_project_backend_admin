import express from 'express';
//import User from '../other_services/model/seqModel';
import { User } from '../other_services/model/seqModel';
import Logger from '../other_services/winstonLogger';
import sequelize from '../other_services/sequelizeConnection';
import conn from '../db_services/db_connection';

const router = express.Router();

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await getUsers();
        console.log('Users fetched successfully');
        res.status(200).send(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Something went wrong while fetching users');
    }});

export async function getUsers() {
    try{
        const userResult = await User.findAll();
        Logger.info("Users fetched successfully");
        return userResult;
        
    }catch(error){
        Logger.error("Error fetching users: ", error);
        throw error;
    }
};


//Get specfic user where role_fk = 3
// Use this to query against the database select * from stohtpsd_company.user where role_fk = 3;
/*
router.get('/customers', async (req, res) => {
    try {
        const users = await getSpecificUser();
        console.log('Specific users fetched successfully');
        res.status(200).send(users);
    } catch (error) {
        console.error('Error fetching specific users:', error);
        res.status(500).send('Something went wrong while fetching specific users');
    }});



export async function getSpecificUser() {
    const connection = await conn.getConnection();
    try{
        const result = await connection.query('select * from stohtpsd_company.user where role_fk = 3')
        Logger.info("Specific users fetched successfully");
        return result[0];
    
    }catch(error){
        Logger.error("Error fetching specific users: ", error);
        throw error;
    }
};
*/




export default router;