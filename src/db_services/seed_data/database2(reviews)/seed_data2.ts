import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

dotenv.config();

// Database 1 (company) - For fetching user IDs
const pool1 = mysql.createPool({
    host: process.env.dev_host,
    user: process.env.dev_user,
    password: process.env.dev_password,
    database: process.env.dev_database,
    ssl: { rejectUnauthorized: true }
});

// Database 2 (reviews) - For inserting reviews
const pool2 = mysql.createPool({
    host: process.env.dev_host2,
    user: process.env.dev_user2,
    password: process.env.dev_password2,
    database: process.env.dev_database2,
    ssl: { rejectUnauthorized: true }
});

export async function seedData2() {
    const connection1 = await pool1.getConnection();
    const connection2 = await pool2.getConnection();
    
    try {
        // Fetch user IDs from database1 (company)
        const [users] = await connection1.query('SELECT id FROM user;');
        const userIds = (users as any[]).map(row => row.id);

        if (userIds.length === 0) {
            console.warn('No users found in company database.');
            return;
        }
        console.log(`Fetched ${userIds.length} user IDs from company database.`);

        // Proceed with database2 (reviews)
        await connection2.ping();
        console.log(`Connected to mysql database: ${process.env.dev_database2}`);

        await connection2.query('SET FOREIGN_KEY_CHECKS = 0;');
        console.log("Disabled foreign key checks.");

        const tablesToDrop = ['reviews'];
        for (const table of tablesToDrop) {
            console.log(`Dropping table '${table}'...`);
            await connection2.query(`DROP TABLE IF EXISTS \`${table}\`;`);
        }
        console.log("All tables have been dropped successfully.");

        await connection2.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log("Re-enabled foreign key checks.");

        console.log("Creating review table...");

        await connection2.query(`
            CREATE TABLE \`review\` (
                \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
                \`media_fk\` bigint unsigned NOT NULL,
                \`title\` varchar(50) NOT NULL,
                \`description\` varchar(750) NOT NULL,
                \`platform_fk\` bigint unsigned NOT NULL,
                \`user_fk\` bigint unsigned NOT NULL,
                \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deletedAt\` datetime DEFAULT NULL,
                \`isBlocked\` tinyint(1) NOT NULL DEFAULT '0',
                PRIMARY KEY (\`id\`),
                KEY \`media_fk\` (\`media_fk\`),
                KEY \`user_fk\` (\`user_fk\`),
                CONSTRAINT \`review_ibfk_1\` FOREIGN KEY (\`media_fk\`) REFERENCES \`media\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`review_ibfk_2\` FOREIGN KEY (\`user_fk\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        console.log("All tables have been created successfully.");

        console.log("Inserting reviews...");

        const totalReviews = 800;
        const reviewBulkInsertSize = 200;
        const maxTitleLength = 50;
        let reviewValues: string[] = [];

        const openingPhrases = [
            "In this episode, we explore",
            "Join us as we dive into",
            "This episode is all about",
            "In this thought-provoking session, we discuss",
            "Get ready for an engaging talk on"
        ];

        await connection2.beginTransaction();

        for (let i = 0; i < totalReviews; i++) {
            const user_fk = userIds[i % userIds.length];
            const media_fk = (i % 4) + 1;
            const platform_fk = (i % 4) + 1;

            const titleAdjective = faker.word.adjective();
            const titleTopic = faker.word.words(2);
            const title = `${titleAdjective} Podcast: ${titleTopic}`.substring(0, maxTitleLength).replace(/['"]/g, "");

            const openingPhrase = faker.helpers.arrayElement(openingPhrases);
            const description = `${openingPhrase}. ${titleTopic.toLowerCase()} dives into ${faker.hacker.ingverb()} ${faker.word.words(10)} and discusses ${faker.word.words(5)} in depth.`
                .replace(/['"]/g, "");

            reviewValues.push(`(${media_fk}, '${title}', '${description}', ${platform_fk}, ${user_fk}, NOW(), NOW(), 0)`);

            if (reviewValues.length >= reviewBulkInsertSize) {
                const query = `
                    INSERT INTO review (media_fk, title, description, platform_fk, user_fk, createdAt, updatedAt, isBlocked)
                    VALUES ${reviewValues.join(", ")};
                `;
                await connection2.query(query);
                reviewValues = [];
            }
        }

        if (reviewValues.length > 0) {
            const query = `
                INSERT INTO review (media_fk, title, description, platform_fk, user_fk, createdAt, updatedAt, isBlocked)
                VALUES ${reviewValues.join(", ")};
            `;
            await connection2.query(query);
        }

        await connection2.commit();
        console.log("Inserted reviews successfully.");

    } catch (err) {
        console.error("Error occurred:", err);
        await connection2.rollback();
    } finally {
        connection1.release();
        connection2.release();
    }
}

export default pool2;
