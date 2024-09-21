import express from "express"; 
import sequelize from "../other_services/sequelizeConnection";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../other_services/model/seqModel";
import { QueryTypes } from 'sequelize';


const router = express.Router();
router.use(express.json()); //middleware for at pars JSON


router.post("/auth/signup", async (req, res) => {
    try {
        const result: any = await createUser(req.body.name, req.body.lastname, req.body.email, req.body.password);
        console.log("result: ", result)
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
            return "Something went wrong while creating user (returning 500)";
        }
    }
})

//Talk about implement tumbstone and snapchot pattern in the database
export async function getUser(email: string, password: string){
    try{
        let user, userData; 
        const user_id_data = await User.findOne({
            where: {email: email},
            attributes: ["id"],
            include: [
                {
                model: User,
                attributes: ["name"]
                },
            ], 
        });

        const userId = user_id_data?.get("id"); 
        console.log("users id: ", userId);
        user = await User.findAll({
            where: {id: userId},
            include: [
                {
                    model: User,
                    attributes: ["name", "lastname"]
                }
            ], 
            order: [["id", "ASC"]],
            limit: 1,
        });
        userData = user[0].get();
            // userData.name is already a string, no need to assign dataValues
            console.log("userData: ", userData)
        
        if (!user) {
            console.log("No user found with the given credentials")
            throw new Error("No user found with the given credentials");
        }else if (!bcrypt.compareSync(password, userData.password)) {
            console.log("Incorrect email or password")
            throw new Error("Incorrect email or password");
        }else {
            return userData; 
        }
    }catch(error){
        console.log("error: ", error)
        throw error; 
    }

};

export async function createUser(name: string, lastname: string, email: string, password: string) {
    try{
        const alreadyExists = await User.findOne({where: {email: email}});
        if(alreadyExists){
            throw {code: 409, message: "User already exists"};
        }
        let hash_password = bcrypt.hashSync(password, 10);
        const result = await sequelize.query('INSERT INTO users (name, lastname, email, password) VALUES (?, ?, ?, ?)',
        {
            replacements: [name, lastname, email, hash_password],
            type: QueryTypes.RAW,
            model: User
        });

        console.log("Created user: ", result);
        
        return result;


    }catch(error){
        throw error;
    }
}

export default router;


