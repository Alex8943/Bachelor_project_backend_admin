import express from 'express';
import logger from '../other_services/winstonLogger';
import {Genre} from '../other_services/model/seqModel';

const router = express.Router();

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


export default router;


