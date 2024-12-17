import express from 'express';
import { ReviewActions, Review } from "../other_services/model/seqModel";
import Logger from "../other_services/winstonLogger";
import verifyUser from './authenticateUser';

const router = express.Router();


router.get('/actions/:userId', verifyUser, async (req, res) => {
    try {
        const likedReviews = await getLikedReviewsByUser({ userId: req.params.userId });
        res.status(200).json(likedReviews);
    } catch (error) {
        Logger.error("Error fetching liked reviews: ", error);
        res.status(500).send("Something went wrong while fetching liked reviews");
    }
});

export async function getLikedReviewsByUser(values: any) {
    try {
        const result = await ReviewActions.findAll({
            attributes: ['user_fk', 'review_fk', 'review_gesture', 'createdAt', 'updatedAt'],
            where: {
                user_fk: values.userId,
                review_gesture: 1
            },
            include: [
                {
                    model: Review,
                    required: true
                }
            ]
        });

        Logger.info('Liked reviews fetched successfully');
        return result;
    } catch (err) {
        Logger.error('Error fetching liked reviews: ', err);
        throw err;
    }
}


// Route for liking a review by a user
router.post('/like', verifyUser, async (req, res) => {
    try {
        const result = await likeReview(req.body);
        res.status(200).json(result);
    } catch (error) {
        Logger.error("Error liking review: ", error);
        res.status(500).send("Something went wrong while liking the review");
    }
});

export async function likeReview(values: any) {
    try {
        // Step 1: Check if the review exists
        const reviewExists = await Review.findByPk(values.reviewId);
        if (!reviewExists) {
            throw new Error("Review not found");
        }

        // Step 2: Check if the user has already liked this review
        const existingLike = await ReviewActions.findOne({
            where: {
                user_fk: values.userId,
                review_fk: values.reviewId,
                review_gesture: 1
            }
        });

        if (existingLike) {
            throw new Error("User has already liked this review");
        }

        // Step 3: Create the "like" record in ReviewActions
        const result = await ReviewActions.create({
            user_fk: values.userId,
            review_fk: values.reviewId,
            review_gesture: 1
        });

        Logger.info('Review liked successfully');
        return result;
    } catch (err) {
        Logger.error('Error liking review: ', err);
        throw err;
    }
}


export default router;
