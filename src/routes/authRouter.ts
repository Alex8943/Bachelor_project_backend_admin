import express, {Request, Response, NextFunction} from "express"; 
import { signUpSchema, loginSchema } from "./validator";
import Joi from "joi"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User, Role } from "../other_services/model/seqModel";
import logger from "../other_services/winstonLogger";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
router.use(express.json()); //middleware for at pars JSON

const validation = (schema: Joi.Schema) => (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if(error){
        return res.status(400).send(error.details[0].message);
    }
    next();
}


router.post("/auth/signup", validation(signUpSchema), async (req, res) => {
    try {
        const { name, lastname, email, password, role_fk } = req.body;

        // Validate role_fk
        if (!role_fk) {
            return res.status(400).json({ message: "Role is required." });
        }

        // Check if user already exists
        const alreadyExists = await User.findOne({ where: { email } });
        if (alreadyExists) {
            return res.status(409).json({ message: "User already exists." });
        }

        // Hash the password
        const hash_password = bcrypt.hashSync(password, 10);

        // Create the user with role_fk
        const newUser = await User.create({
            name,
            lastname,
            email,
            password: hash_password,
            role_fk,
        });

        // Fetch the user with role details
        const userWithRole = await User.findOne({
            where: { id: newUser.id },
            attributes: ["id", "name", "lastname", "email", "role_fk"],
            include: [{ model: Role, attributes: ["name"] }],
        });

        if (!userWithRole) {
            return res.status(404).json({ message: "Failed to fetch user role after signup." });
        }

        const userData = {
            ...userWithRole.toJSON(), // Convert Sequelize object to plain JSON
            Role: userWithRole.Role ? { name: userWithRole.Role.name } : null, // Flatten the Role object
        };

        // Prepare JWT payload
        const jwtUser = {
            id: userData.id,
            name: userData.name,
            lastname: userData.lastname,
            email: userData.email,
            role_fk: userData.role_fk,
            roleName: userData.Role ? userData.Role.name : null,
        };

        // Generate JWT token
        const token = jwt.sign({ user: jwtUser }, process.env.JWT_SECRET || "secret");

        // Response payload
        const resultWithToken = {
            authToken: token,
            user: userData,
        };

        console.log("User: ", resultWithToken, " Has signed up");
        res.status(200).json(resultWithToken);
    } catch (err: any) {
        console.error("Error during signup:", err);
        res.status(500).json({ message: "Something went wrong while creating user." });
        logger.error(err.message);
    }
});





router.post("/auth/login", validation(loginSchema), async (req, res) => {
    try {
        const result: any = await getUser(req.body.email, req.body.password);
        let jwtUser = {
            "id": result.id,
            "name": result.name,
            "lastname": result.lastname,
            "email": result.email,
            "password": result.password,
            "role_fk": result.role_fk, // Include role_fk in the JWT payload
            "roleName": result.role ? result.role.name : null // Include role name if available
        }
        console.log("Role fk: ", jwtUser.role_fk);
       
        let resultWithToken = {"authToken": jwt.sign({ user: jwtUser }, "secret"), "user": result};
        res.status(200).send(resultWithToken);
        console.log("User:", jwtUser.name, "has signed in");
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
        // Fetch user details using the email, including the role_fk
        const user = await User.findOne({
            where: { email: email },
            attributes: ["id", "name", "lastname", "email", "password", "role_fk"], // Include role_fk in attributes
            include: [
                {
                    model: Role,
                    attributes: ["name"],
                }
            ]
        });

        if (!user) {
            logger.error("No user found with the given credentials");
            console.log("No user found with the given credentials");
            throw new Error("No user found with the given credentials");
        }

        const userData = user.get(); // Extract user data, including role_fk and role name
        console.log("User's data with role_fk and role name:", userData); // Log the data to verify

        return userData;
    } catch (error) {
        console.log("error: ", error);
        throw error;
    }
}



export default router;


