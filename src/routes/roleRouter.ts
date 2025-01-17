import express from 'express';
import Logger from '../other_services/winstonLogger';
import conn from '../db_services/local/db_connection';
import { User, Role } from '../other_services/model/seqModel';
import verifyUser from './authenticateUser';

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
      const roles = await Role.findAll({
        attributes: ["id", "name"],
      });
      return roles;
    } catch (error) {
      Logger.error("Error fetching roles: ", error);
      throw error;
    }
  }



router.get("/role/:id", verifyUser, async function (req, res) {
    try {
        const id = parseInt(req.params.id);
        console.log("req to backend", req.params.id);
        const users = await getRoleById(id);
        res.status(200).send(users);
    } catch (error) {
        console.error('Error fetching users by role:', error);
        res.status(500).send('Something went wrong while fetching users by role');
    }
  });

export async function getRoleById(id: number){
  try{
    
    const role = await Role.findAll({
      where: {id: id},
    });

    console.log("Roles fetched successfully");
    return role;
  }catch(error){
    console.log("Error in getRoleById: ", error);
  }
}

export default router;