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
    const t = await sequelize.transaction(); 

    try {
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
        

        if (values.genre_ids && values.genre_ids.length > 0) {
            const reviewGenreRecords = values.genre_ids.map((genre_id: number) => ({
                review_fk: review,  
                genre_fk: genre_id,
            }));
            await ReviewGenres.bulkCreate(reviewGenreRecords, { transaction: t });
        }

        await t.commit(); 
        logger.info("Review created successfully");
        return { reviewId: review };

    } catch (err) {
        await t.rollback();
        logger.error("Error during review creation: ", err);
        throw err;
    }
}


router.put("/update/:id/review", async (req, res) => {
    try{
        const reviewId = parseInt(req.params.id); // Extract `id` from the URL as a number
        const result = await updateReview(reviewId, req.body); // Pass `reviewId` and `req.body` separately

        res.status(200).send(result);

    }catch(error){
        console.error("error creating review: ", error)
        res.status(500).send("Something went wrong with updating the review " )
    }
})

export async function updateReview(id: number, data: any) {
    try {
        // Update review by `id` with new `title` and `description` from `data`
        const [updatedCount] = await Reviews.update(
            {
                title: data.title,
                description: data.description
            },
            {
                where: { id: id }
            }
        );

   
        await ReviewGenres.destroy({ where: { review_fk: id } });

        if (data.genre_ids && data.genre_ids.length > 0) {
            const reviewGenreRecords = data.genre_ids.map((genre_id: number) => ({
                review_fk: id,
                genre_fk: genre_id,
            }));
            await ReviewGenres.bulkCreate(reviewGenreRecords);
        }

        logger.info("Review updated successfully");


        return { message: "Review updated successfully" };
    } catch (error) {
        logger.error("Error during review update: ", error);
        throw error;
    }
}





export default router;
