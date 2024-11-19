import express from 'express';
import { User, Review } from '../other_services/model/seqModel';
import Logger from '../other_services/winstonLogger';
import sequelize from '../other_services/sequelizeConnection';
import conn from '../db_services/db_connection';
import { get } from 'http';

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
router.get('/user/:id', async (req, res) => {
    try {
        const users = await getUserById(req.params.id);
        console.log('Specific users fetched successfully');
        res.status(200).send(users);
    } catch (error) {
        console.error('Error fetching specific users:', error);
        res.status(500).send('Something went wrong while fetching specific users');
    }});



export async function getUserById(value: any){
    try{
        const userResult = await User.findOne({
            where: {id: value}
        });
        Logger.info("Specific users fetched successfully");
        return userResult;
    }catch(error){
        Logger.error("Error fetching specific users: ", error);
        throw error;
    }
}

//Get all reviews made by a specific user
router.get("/user/:id/reviews", async (req, res) => {
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

router.get("/reviews/:max", async (req, res) => {
    try {
        // Convert `max` to a number
        const max = parseInt(req.params.max, 10);

        // Validate if `max` is a valid number
        if (isNaN(max) || max <= 0) {
            return res.status(400).send("Invalid max parameter. It should be a positive number.");
        }

        const reviews = await getRangeOfReviews(max);
        console.log("Specific reviews fetched successfully");
        res.status(200).send(reviews);
    } catch (error) {
        console.error("Error fetching specific reviews:", error);
        res.status(500).send("Something went wrong while fetching specific reviews");
    }
});


// Function to fetch reviews
export async function getRangeOfReviews(max: any) {
    try {
        const reviews = await Review.findAll({
            limit: max, // Sequelize will now receive a number
        });
        return reviews;
    } catch (error) {
        Logger.error("Error fetching specific reviews: ", error);
        throw error;
    }
}




export default router;