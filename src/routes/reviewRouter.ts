import express from "express";
import { Review  } from "../other_services/model/seqModel";
import logger from "../other_services/winstonLogger"
import sequelize from "../other_services/sequelizeConnection";

const router = express.Router();

router.get("/reviews", async(req, res) => {
    try {
        const reviews = await getReviews();
        res.status(200).send(reviews);
    
    } catch (err) {
        res.status(500).send("Something went wrong while fetching reviews");
    }

});

export async function getReviews() {
    try {
       const result = await Review.findAll({
            attributes: ['id', 'media_fk', 'title', 'description', 'user_fk']
        });
        logger.info("Reviews fetched successfully");
        return result.map((review: any) => {
            return {
                "id": review.id,
                "media_fk": review.media_fk,
                "title": review.title,
                "description": review.description,
                "user_fk": review.user_fk
            }
       })
        
    } catch (err) {
        console.log("Error: ", err);
        logger.error("Something went wrong while fetching reviews");
        return "Something went wrong while fetching reviews (returning 500)";
    }
}



router.post("/review", async (req, res) => {
    try {
        const result = await createReview(req.body);
        res.status(200).send(result);
    } catch (err) {
        console.error("Error creating review: ", err);
        res.status(500).send("Something went wrong while creating the review");
    }
});


export async function createReview(values: Review) {
    try {
        // create a new review
        const result = await Review.create({
            media_fk: values.media_fk,
            title: values.title,
            description: values.description,
            user_fk: values.user_fk,
        });
        logger.info("Review created successfully");
        return result;
    } catch (err) {
        logger.error("Error during review creation: ", err);
        throw err;  // Re-throw the error so the route handler can catch it
    }
}


export default router;