import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export async function syncDatabases() {
    console.log('Syncing databases...');
    
    const db1 = await mysql.createConnection({
        host: process.env.prod_host,
        user: process.env.prod_user,
        password: process.env.prod_password,
        database: process.env.prod_database,
        ssl: { rejectUnauthorized: true }
    });

    const db2 = await mysql.createConnection({
        host: process.env.prod_host2,
        user: process.env.prod_user2,
        password: process.env.prod_password2,
        database: process.env.prod_database2,
        ssl: { rejectUnauthorized: true }
    });

    try {
        // Fetch data from Database 1
        const [reviews]: [any[], any] = await db1.execute('SELECT * FROM review');

        // Clear existing data in Database 2 (Optional, if full overwrite is needed)
        await db2.execute('DELETE FROM reviews');

        // Prepare bulk insert query
        const insertQuery = `
        INSERT INTO reviews (
            id, 
            media_fk, 
            title, 
            description, 
            platform_fk, 
            user_fk, 
            createdAt, 
            updatedAt, 
            deletedAt
        ) 
        VALUES ?
        `;

        // Chunking data for bulk insertion
        const chunkSize = 50000; // Insert 1000 rows at a time
        const chunks = [];

        for (let i = 0; i < reviews.length; i += chunkSize) {
            const chunk = reviews.slice(i, i + chunkSize).map((review: any) => [
                review.id,
                review.media_fk,
                review.title,
                review.description,
                review.platform_fk,
                review.user_fk,
                review.createdAt,
                review.updatedAt,
                review.deletedAt,
            ]);
            chunks.push(chunk);
        }

        // Execute bulk insert for each chunk
        for (const chunk of chunks) {
            console.log("Inserting reviews: ", chunk.length);
            await db2.query(insertQuery, [chunk]);
        }

        console.log('Data synchronization completed successfully!');
    } catch (err) {
        console.error("There was an error syncing the databases: ", err);
    } finally {
        // Close database connections
        await db1.end();
        await db2.end();
    }
};
