import express from "express";
import { Review as Reviews, User, Media, Genre, ReviewGenres } from "../other_services/model/seqModel";
import logger from "../other_services/winstonLogger";
import sequelize from "../other_services/sequelizeConnection";
import { QueryTypes } from "sequelize";

const router = express.Router();

// Get all reviews with media, user, and genres
router.get("/reviews", async (req, res) => {
    try {
        const reviews = await getReviews();
        res.status(200).send(reviews);
    } catch (err) {
        console.error("Error fetching reviews: ", err);
        res.status(500).send("Something went wrong while fetching reviews");
    }
});

export async function getReviews() {
    try {
    const result = await Reviews.findAll({
        include: [
            {
                model: User,
                attributes: ["name"],
            },
            {
                model: Media,
                attributes: ["name"],
            },
            {
                model: Genre,
                attributes: ["name"],
            },
        ]
    });
        logger.info("Reviews fetched successfully");
        return result;
    } catch (err) {
        logger.error("ERROR: \n", err);
        throw err;
    }
}


// Create a new review with genres
router.post("/review", async (req, res) => {
    try {
        const result = await createReview(req.body);
        res.status(200).send(result);
    } catch (err) {
        console.error("Error creating review: ", err);
        res.status(500).send("Something went wrong while creating the review");
    }
});

export async function createReview(values: any) {
    const t = await sequelize.transaction(); // Use transaction for atomic operations
    try {
         // Execute the SQL command to insert a new review
         const [review] = await sequelize.query(
            'INSERT INTO `review` (`id`, `media_fk`, `title`, `description`, `platform_fk`, `user_fk`, `createdAt`, `updatedAt`, `isBlocked`) VALUES (DEFAULT, ?, ?, ?, ?, ?, NOW(), NOW(), FALSE);',
            {
                replacements: [
                    values.media_fk,
                    values.title,
                    values.description,
                    values.platform_fk,
                    values.user_fk,
                ],
                type: QueryTypes.INSERT,
                transaction: t
            }
        );
        
        // If genres are provided, associate them with the review
        if (values.genre_ids && values.genre_ids.length > 0) {
            const reviewGenreRecords = values.genre_ids.map((genre_id: number) => ({
                review_fk: review,  // Sequelize returns the auto-generated ID from the insert
                genre_fk: genre_id,
            }));
            await ReviewGenres.bulkCreate(reviewGenreRecords, { transaction: t });
        }

        await t.commit(); // Commit the transaction
        logger.info("Review created successfully");
        return { reviewId: review }; // Return the review ID or other relevant information

    } catch (err) {
        await t.rollback(); // Rollback in case of error
        logger.error("Error during review creation: ", err);
        throw err;
    }
}


/*
// Update a review
export async function updateReview(review_id: number){
    try{
        const review = await Reviews.findByPk(review_id);
        if (!review) {
            throw new Error("Review not found");
        }
        review.title = "Updated title";
        await review.save();
        logger.info("Review updated successfully");
        return review;
    }catch(error){
        logger.error("Error during review creation: ", error);
        throw error;
    }
}
    */


export default router;
