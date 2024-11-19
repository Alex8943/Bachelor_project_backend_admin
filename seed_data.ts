import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.dev_host,
    user: process.env.dev_user,
    password: process.env.dev_password,
    database: process.env.dev_database,
});

export async function seedData() {
    const connection = await pool.getConnection();
    try {
        // Dropping all tables:
        await connection.ping();
        console.log(`Connected to mysql database: ${process.env.dev_database}`);

        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
        console.log("Disabled foreign key checks.");

        const tablesToDrop = ['review_actions', 'review_genres', 'review', 'platform', 'media', 'genre', 'role'];

        for (const table of tablesToDrop) {
            console.log(`Dropping table '${table}'...`);
            await connection.query(`DROP TABLE IF EXISTS \`${table}\`;`);
        }

        console.log("Dropping table 'user'...");
        await connection.query('DROP TABLE IF EXISTS `user`;');

        console.log("All tables have been dropped successfully.");

        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log("Re-enabled foreign key checks.");

        // Creating tables
        console.log("Creating tables...");

        await connection.query(`
            CREATE TABLE \`role\` (
                \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
                \`name\` varchar(20) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        await connection.query(`
            CREATE TABLE \`user\` (
                \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
                \`name\` varchar(20) NOT NULL,
                \`lastname\` varchar(45) NOT NULL,
                \`email\` varchar(100) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`role_fk\` bigint unsigned DEFAULT NULL,
                \`verification_key\` varchar(38) DEFAULT NULL,
                \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deletedAt\` datetime DEFAULT NULL,
                \`verifiedAt\` datetime DEFAULT NULL,
                \`isBlocked\` tinyint(1) NOT NULL DEFAULT '0',
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`email\` (\`email\`),
                KEY \`role_fk\` (\`role_fk\`),
                CONSTRAINT \`user_ibfk_1\` FOREIGN KEY (\`role_fk\`) REFERENCES \`role\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        await connection.query(`
            CREATE TABLE \`media\` (
                \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
                \`name\` varchar(10) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        await connection.query(`
            CREATE TABLE \`genre\` (
                \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
                \`name\` varchar(20) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        await connection.query(`
            CREATE TABLE \`platform\` (
                \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
                \`link\` varchar(200) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        await connection.query(`
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

        await connection.query(`
            CREATE TABLE \`review_genres\` (
                \`review_fk\` bigint unsigned NOT NULL,
                \`genre_fk\` bigint unsigned NOT NULL,
                PRIMARY KEY (\`review_fk\`, \`genre_fk\`),
                KEY \`genre_fk\` (\`genre_fk\`),
                CONSTRAINT \`review_genres_ibfk_1\` FOREIGN KEY (\`review_fk\`) REFERENCES \`review\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`review_genres_ibfk_2\` FOREIGN KEY (\`genre_fk\`) REFERENCES \`genre\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        await connection.query(`
            CREATE TABLE \`review_actions\` (
                \`user_fk\` bigint unsigned NOT NULL,
                \`review_fk\` bigint unsigned NOT NULL,
                \`review_gesture\` tinyint(1) NOT NULL DEFAULT '1',
                \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`user_fk\`, \`review_fk\`),
                KEY \`review_fk\` (\`review_fk\`),
                CONSTRAINT \`review_actions_ibfk_1\` FOREIGN KEY (\`user_fk\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`review_actions_ibfk_2\` FOREIGN KEY (\`review_fk\`) REFERENCES \`review\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        console.log("All tables have been created successfully.");
        
        // Inserting static data
        console.log("Inserting static data...");

        // Insert roles
        await connection.query(`
            INSERT INTO \`role\` (\`name\`) VALUES
            ('super admin'),
            ('admin'),
            ('customer');
        `);
        console.log("Inserted data into 'role' table.");

        // Insert media
        await connection.query(`
            INSERT INTO \`media\` (\`name\`) VALUES
            ('Book'),
            ('Movie'),
            ('Podcast'),
            ('Video Game');
        `);
        console.log("Inserted data into 'media' table.");

        // Insert genres
        await connection.query(`
            INSERT INTO \`genre\` (\`name\`) VALUES
            ('Comedy'),
            ('Educational'),
            ('Action'),
            ('Drama');
        `);
        console.log("Inserted data into 'genre' table.");

        // Insert platforms
        await connection.query(`
            INSERT INTO \`platform\` (\`link\`) VALUES
            ('https://example.com/platform1'),
            ('https://example.com/platform2'),
            ('https://example.com/platform3'),
            ('https://example.com/platform4');
        `);
        console.log("Inserted data into 'platform' table.");

        const numOfUsers = 5;
        let userIds = [];
        for (let y = 0; y < 5; y++) {
            for (let i = 1; i <= numOfUsers; i++) {
                const firstName = faker.person.firstName();
                const lastName = faker.person.lastName();
                const random = Math.floor(100 + Math.random() * 900);
                const email = `${firstName}${random}@example.com`;
                const plainPassword = "password"; // Plaintext password
                const hashedPassword = await bcrypt.hash(plainPassword, 10); // Hash the password
                const role_fk = (i % 3) + 1; // Role ID (1, 2, 3 in rotation)

                const [result] = await connection.query<mysql.OkPacket>(`
                    INSERT INTO user (name, lastname, email, password, role_fk, createdAt, updatedAt)
                    VALUES (?, ?, ?, ?, ?, NOW(), NOW());
                `, [firstName, lastName, email, hashedPassword, role_fk]);

                userIds.push(result.insertId); // Store the generated user ID
            }
        }

        // Insert reviews
        let reviewValues = "";
        for (let i = 0; i < userIds.length; i++) {
            const user_fk = userIds[i];
            const media_fk = (i % 4) + 1; // Rotate through media IDs
            const platform_fk = (i % 4) + 1; // Rotate through platform IDs
            const title = faker.lorem.words(5);
            const description = faker.lorem.words(50);
            reviewValues += `(${media_fk}, '${title}', '${description}', ${platform_fk}, ${user_fk}, NOW(), NOW(), 0),`;
        }
        reviewValues = reviewValues.slice(0, -1); // Remove trailing comma

        await connection.query(`
            INSERT INTO review (media_fk, title, description, platform_fk, user_fk, createdAt, updatedAt, isBlocked)
            VALUES ${reviewValues};
        `);
        console.log("Inserted reviews.");

        // Insert review_genres
        await connection.query(`
            INSERT INTO review_genres (review_fk, genre_fk) VALUES
            (1, 2),
            (2, 3),
            (3, 2),
            (4, 1),
            (1, 3),
            (2, 4);
        `);
        console.log("Inserted data into 'review_genres' table.");

        // Insert review actions
        await connection.query(`
            INSERT INTO review_actions (user_fk, review_fk, review_gesture, createdAt, updatedAt) VALUES
            (${userIds[0]}, 1, 1, NOW(), NOW()),
            (${userIds[1]}, 1, 0, NOW(), NOW()),
            (${userIds[2]}, 2, 1, NOW(), NOW()),
            (${userIds[3]}, 3, 1, NOW(), NOW()),
            (${userIds[0]}, 4, 1, NOW(), NOW());
        `);
        console.log("Inserted data into 'review_actions' table.");

        console.log("Static data insertion completed successfully.");

    } catch (err) {
        console.error("Error occurred:", err);
        process.exit(1);
    } finally {
        connection.release(); // Always release the connection
    }
}


export default pool;


        /*
        await connection.ping();
        console.log(`Connected to mysql database name: ${process.env.dev_database}`);

        const dropTableItems = `DROP TABLE IF EXISTS items`;
        
        await connection.query<mysql.OkPacket>(dropTableItems);
         // Check the result and log
         if (result.warningStatus === 0) {
            console.log("Table 'items' has been successfully dropped or did not exist.");
        } else {
            console.log("Table 'items' drop query executed, but warnings were returned.");
        }
        console.log("Finished dropping table 'items'");
        
        const createTableItems = `CREATE TABLE items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT
            
        )`;

        await connection.query<mysql.OkPacket>(createTableItems);

        console.log("Finished creating table 'items'");


        const insertItem = `INSERT INTO items (name, description) VALUES ('First item', 'This is the first item we have created')`;

        await connection.query<mysql.OkPacket>(insertItem);
        for(let i = 0; i < 10000; i++) {
            let values = ""
            let values_for_revies = ""
            for (let i = 1; i < 10; i++) {
                // the users's id is i
                values += `('Item ${i}', 'This is item ${i}'),` 
                values_for_reviews += `(1, 'Title', 'Description', ${i})`
            }
            values = values.slice(0, -1);
            console.log(values)
            const insertItems = `INSERT INTO items (name, description) VALUES ${values}`;
            await connection.query<mysql.OkPacket>(insertItems);
        }
            */
