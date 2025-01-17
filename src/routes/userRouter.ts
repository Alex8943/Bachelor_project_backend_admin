import express from 'express';
import { User, Review, Role } from '../other_services/model/seqModel';
import Logger from '../other_services/winstonLogger';
import sequelize from '../other_services/sequelizeConnection';
import conn from '../db_services/local/db_connection';
import logger from '../other_services/winstonLogger';
import { RowDataPacket } from "mysql2/promise";
import verifyUser from './authenticateUser';
import { verify } from 'crypto';

const router = express.Router();


router.get('/users/:max/:offset', verifyUser, async (req, res) => {
    try {
      const max = parseInt(req.params.max, 10); // Number of users to fetch
      const offset = parseInt(req.params.offset, 10); // Starting point for fetching users
  
      const users = await getUsers(max, offset); // Pass max and offset to the function
      res.status(200).send(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send('Something went wrong while fetching users');
    }
});
  

export async function getUsers(max: number, offset: number) {
    try {
          const userResult = await User.findAll({
            where: { isBlocked: false },
            limit: max,
            offset: offset, 
            include: [
              {
                model: sequelize.models.Role,
                attributes: ['name'],
              },
            ],
            attributes: { exclude: ['password'] },
          });
      
          console.log(`Users fetched: ${userResult.length}, Offset: ${offset}`);
          return userResult;
    } catch (error) {
          Logger.error('Error fetching users: ', error);
          throw error;
    }
}
      
    

router.get('/user/:id', verifyUser ,async (req, res) => {
    try {
        const users = await getUserById(req.params.id);
        res.status(200).send(users);
    } catch (error) {
        console.error('Error fetching specific users:', error);
        res.status(500).send('Something went wrong while fetching specific users');
    }});



    export async function getUserById(value: any) {
        try {
          const userResult = await User.findOne({
            where: { id: value }, // Match the specific user by ID
            include: [
              {
                model: Role, // Ensure Role is imported from your models
                attributes: ["name"], // Include only the 'name' attribute of the Role model
              },
            ],
            attributes: { exclude: ["password"] }, // Exclude sensitive fields like password
          });
      
          if (!userResult) {
            Logger.warn(`User with ID ${value} not found.`);
            return null; // Return null if the user does not exist
          }
      
          return userResult;
        } catch (error) {
          Logger.error("Error fetching specific user: ", error);
          throw error;
        }
      }
      
/*
      router.get('/users/role/:id', verifyUser, async (req, res) => {
        try {
            const id = parseInt(req.params.id, 10);
            const offset = parseInt(req.query.offset as string, 10) || 0; // Default to 0
            const limit = parseInt(req.query.limit as string, 10) || 25;  // Default to 25
    
            if (isNaN(id) || isNaN(offset) || isNaN(limit)) {
                return res.status(400).send('Invalid parameters.');
            }
    
            const users = await getUsersByRole(id, offset, limit);
            console.log('Specific users fetched successfully');
            res.status(200).send(users);
        } catch (error) {
            console.error('Error fetching specific users:', error);
            res.status(500).send('Something went wrong while fetching specific users');
        }
    });
      
        
    
    export async function getUsersByRole(roleId: number, offset = 0, limit = 25) {
        try {
            const users = await User.findAll({
                where: { role_fk: roleId }, // Ensure you're filtering by role_fk
                include: [
                    {
                        model: Role,
                        attributes: ['id', 'name'], // Include only necessary Role attributes
                    },
                ],
                offset, // Use Sequelize's offset
                limit,  // Use Sequelize's limit
            });
            return users;
        } catch (error) {
            console.error('Error fetching users by role:', error);
            throw error;
        }
    }

    */

    
    
      
      

//Get all reviews made by a specific user
router.get("/user/:id/reviews", verifyUser, async (req, res) => {
    try{
        
        const reviews = await getReviewsByUserId(req.params.id);
        console.log('Specific reviews fetched successfully');
        res.status(200).send(reviews);
        
    }catch(error){
        console.error('Error fetching specific reviews:', error);
        res.status(500).send('Something went wrong while fetching specific reviews');
    
    }});

export async function getReviewsByUserId(value: any){
    try{

        const reviews = await Review.findAll({
            where: { user_fk: value }, // Filter reviews by user foreign key
        });
        return reviews;

    }catch(error){
        Logger.error("Error fetching specific reviews: ", error);
        throw error;
    }

};

router.get('/softDeletedUsers', verifyUser, async (req, res) => {
    try {
        const users = await showAllDeletedUsers();
        console.log('Deleted users fetched successfully');
        res.status(200).send(users);
    } catch (error) {
        console.error('Error fetching deleted users:', error);
        res.status(500).send('Something went wrong while fetching deleted users');
    }});


export async function showAllDeletedUsers(){
    try{
        const deletedUsers = await User.findAll({
            where: { isBlocked: true }, 
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: sequelize.models.Role, 
                    attributes: ['name'],
                    
                },
            ],
        });
        Logger.info("Deleted users fetched successfully");
        return deletedUsers;
    }catch(error){
        Logger.error("Error fetching deleted users: ", error);
        throw error;
    }
}


router.get('/findUser/:name', verifyUser, async (req, res) => {
    try {
        const user = await searchUserByName(req.params.name);
        if (!user) {
            console.log('User not found');
            return res.status(404).send({ message: 'User not found' });
        }
        console.log('Specific user fetched successfully');
        res.status(200).send(user);
    } catch (error) {
        console.error('Error fetching specific user:', error);
        res.status(500).send('Something went wrong while fetching the user');
    }
});

export async function searchUserByName(value: string) {
    const connection = await conn.getConnection();
    try {
        const query = `
            SELECT u.*, r.name AS roleName
            FROM user u
            LEFT JOIN role r ON u.role_fk = r.id
            WHERE u.name LIKE ?
        `;

        // Properly type the result to match the structure
        const [rows] = await connection.execute<RowDataPacket[]>(query, [`%${value}%`]);
        
        if (rows.length === 0) {
            Logger.error("User does not exist");
            return null;
        }

        Logger.info("User searched successfully");
        return rows;
    } catch (error) {
        Logger.error("Error searching user: ", error);
        throw error;
    }
}

router.put("/delete/user/:id", verifyUser, async (req, res) => {
    try{
        console.log("req.params.id: ", req.params.id);
        const result = await softDeleteUser(req.params.id); // Pass `userId` and `req.body` separately
        res.status(200).send(result);

    }catch(error){
        console.error("error updating user: ", error)
        res.status(500).send("Something went wrong with updating the user " )
    }
});


export async function softDeleteUser(id: any){
    try{
        const user = await User.findByPk(id);

        if(!user){
            console.log("User does not exist");
            Logger.error("User does not exist");
            return "User does not exist";

        }else if(user.isBlocked == true){
            console.log("User is already blocked");
            Logger.error("User is already blocked");
            return "User is already blocked";
        }
        
        console.log("User exists");


        await User.update(
            { isBlocked: true },
            { where: { id: id } }
        );

        Logger.info("User blocked successfully");
        return { message: "User blocked successfully" };
    }catch(error){
        Logger.error("Error deleting user: ", error);
        throw error;
    }
}


router.put('/update/user/:id', verifyUser, async (req, res) => {
    try {
        const result = await updateUser(req.params.id, req.body);
        res.status(200).send(result);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Something went wrong while updating the user');
    }
});

export async function updateUser(id: any, data: any) {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            console.log('User does not exist');
            Logger.error('User does not exist');
            return 'User does not exist';
        }
        console.log('User exists');

        await User.update(data, { where: { id: id } });
        Logger.info('User updated successfully');

        return { message: 'User updated successfully' };
    } catch (error) {
        console.error('Error updating user:', error);
        Logger.error('Error updating user:', error);
        throw error;
    }
}

router.put('/undelete/user/:id', verifyUser, async (req, res) => {
    try {
        const result = await undeleteUser(req.params.id);
        res.status(200).send(result);
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).send('Something went wrong while unblocking the user');
    }
});

export async function undeleteUser(id: any){
    try{
        const user = await User.findByPk(id);

        if(!user){
            console.log("User does not exist");
            Logger.error("User does not exist");
            return "User does not exist";

        }else if(user.isBlocked == false){
            console.log("User is already unblocked");
            Logger.error("User is already unblocked");
            return "User is already unblocked";
        }
        
        console.log("User exists");


        await User.update(
            { isBlocked: false },
            { where: { id: id } }
        );

        Logger.info("User unblocked successfully");
        return { 
            message: 
            "User unblocked successfully" 
        };
    }catch(error){
        Logger.error("Error unblocking user: ", error);
        throw error;
    };

}

export default router



