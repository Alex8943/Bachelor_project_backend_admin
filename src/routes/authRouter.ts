import express from "express"; 
import sequelize from "../other_services/sequelizeConnection";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../other_services/model/seqModel";
import { QueryTypes } from 'sequelize';
import logger from "../other_services/winstonLogger";


const router = express.Router();
router.use(express.json()); //middleware for at pars JSON


router.post("/auth/signup", async (req, res) => {
    try {
        const result: any = await createUser(req.body.name, req.body.lastname, req.body.email, req.body.password);
      
        let jwtUser = {
            "id": result.id,
            "name": result.name,
            "lastname": result.lastname,
            "email": result.email,
            "password": result.password
        }
        let resultWithToken = {"authToken": jwt.sign({ user: jwtUser }, "secret"), "user": result};
        res.status(200).send(resultWithToken);
        console.log("Only token: ", jwtUser)
        return resultWithToken;
    } catch (err:any) {
        if (err.code == 409){
            res.status(409).send(err.message);
            return err.message;
        } else {
            res.status(500).send("Something went wrong while creating user ");
            console.log("Error: ", err)
            logger.error(err.message);
            return "Something went wrong while creating user (returning 500)";
        }
    }
})

router.post("/auth/login", async (req, res) => {
    try {
        const result: any = await getUser(req.body.email, req.body.password);
        let jwtUser = {
            "id": result.id,
            "name": result.name,
            "lastname": result.lastname,
            "email": result.email,
            "password": result.password
        }
        let resultWithToken = {"authToken": jwt.sign({ user: jwtUser }, "secret"), "user": result};
        res.status(200).send(resultWithToken);
        console.log("User: ", jwtUser.name, ", has signed in")
        return resultWithToken;
    }catch(err:any){
        if (err.message == "No user found with the given credentials"){
            res.status(404).send(err.message);
            logger.error(err.message);
            return err.message;
        }else if (err.message == "Incorrect email or password"){
            res.status(401).send(err.message);
            logger.error(err.message);
            return err.message;
        }else{
            res.status(500).send("Something went wrong while logging in");
            console.log("Error: ", err)
            logger.error(err.message);
            return "Something went wrong while logging in (returning 500)";
        }
    }
}); 


export async function getUser(email: string, password: string) {
    try {
        // Fetch user ID using the email
        const user_id_data = await User.findOne({
            where: { email: email },
            attributes: ["id"]
        });

        const userId = user_id_data?.get("id");
        console.log("User's id: ", userId);

        if (!userId) {
            logger.error("No user found with the given credentials");
            console.log("No user found with the given credentials");
        }

        // Fetch user details using the ID
        const user = await User.findOne({
            where: { id: userId },
            attributes: ["name", "lastname", "password"], // Ensure password is included
        });

        if (!user) {
            throw new Error("No user found with the given credentials");
        }

        const userData = user.get(); // Extract user data
        

        return userData;
    } catch (error) {
        console.log("error: ", error);
        throw error;
    }
}

export async function createUser(name: string, lastname: string, email: string, password: string) {
    try{
        const alreadyExists = await User.findOne({where: {email: email}});
        if(alreadyExists){
            throw {code: 409, message: "User already exists"};
        }
        let hash_password = bcrypt.hashSync(password, 10);
        
        const result = await User.create({
            name: name,
            lastname: lastname,
            email: email,
            password: hash_password,
            role_fk: 1,
        });

        console.log("Created user: ", result);
        
        return result;
    }catch(error){
        throw error;
    }
}

export default router;


