import express from 'express';
import logger from '../other_services/winstonLogger';
import {Genre} from '../other_services/model/seqModel';
import sequelize from '../other_services/sequelizeConnection';
import {Review} from '../other_services/model/seqModel';

const router = express.Router();
/*
// Get all genres
router.get('/genres', async (req, res) => {
    try {
        const genres = await getGenres();
        res.status(200).send(genres);
    } catch (err) {
        console.error('Error fetching genres: ', err);
        res.status(500).send('Something went wrong while fetching genres');
    }
});


export async function getGenres() {
    try {
        const result = await Genre.findAll();
        logger.info('Genres fetched successfully');
        return result;
    } catch (err) {
        logger.error('ERROR: \n', err);
        throw err;
    }
}
*/


// Get top 3 genres
router.get('/genres/top', async (req, res) => {
    try {
        const genres = await getTopGenres();
        res.status(200).send(genres);
    } catch (err) {
        console.error('Error fetching top genres: ', err);
        res.status(500).send('Something went wrong while fetching top genres');
    }});


export async function getTopGenres() {
    try {
        const topGenres = await Genre.findAll({
          attributes: [
            'id',
            'name',
            [sequelize.fn('COUNT', sequelize.col('reviews.id')), 'count'] // Count of reviews for each genre
          ],
          include: [
            {
              model: Review,
              attributes: []
            }
          ],
          group: ['Genre.id'],
          order: [[sequelize.literal('count'), 'DESC']],
          limit: 4 // Return top 4 genres
        });
        logger.info('Top genres fetched successfully');
        return topGenres;
      
      } catch (error) {
        console.error('Error fetching top genres:', error);
       
      }
    }


export default router;


