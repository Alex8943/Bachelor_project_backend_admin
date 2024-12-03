import express from 'express';
import Logger from '../other_services/winstonLogger';
import conn from '../db_services/db_connection';
import { User, Role } from '../other_services/model/seqModel';


const router = express.Router();


//Get role id's
router.get("/roles", async function (req, res) {
    try {
        const roles = await getRoles();
        console.log('Roles fetched successfully');
        res.status(200).send(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).send('Something went wrong while fetching roles');
    }
});


export async function getRoles() {
    try {
      // Fetch all roles
      const roles = await Role.findAll({
        attributes: ["id", "name"], // Fetch only necessary attributes
      });
      return roles;
    } catch (error) {
      Logger.error("Error fetching roles: ", error);
      throw error;
    }
  }
  ``
  

export default router;