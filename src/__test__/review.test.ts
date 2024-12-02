import request from 'supertest';
import app from '../app'; // Import your Express app


    jest.mock('../routes/authenticateUser', () => {
        return jest.fn((req, res, next) => next());
    });


    describe('Review Controller', () => {
    it('should fetch excacly amount of reviews', async () => {
        const response = await request(app).get('/reviews/25'); // Adjust the endpoint
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    describe('Review Controller', () => {
        it('should create a new review with genres', async () => {
          const reviewData = {
            media_fk: 1, // Assuming media ID 1 exists
            title: 'Test Review',
            description: 'This is a test review description.',
            platform_fk: 2, // Assuming platform ID 2 exists
            user_fk: 3, // Assuming user ID 3 exists
            genre_ids: [1, 2], // Assuming genre IDs 1 and 2 exist
          };
      
          const response = await request(app)
            .post('/review')
            .send(reviewData); // Send the review data in the request body
      
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('reviewId'); // Expect response to contain the review ID
        });
    });
});
