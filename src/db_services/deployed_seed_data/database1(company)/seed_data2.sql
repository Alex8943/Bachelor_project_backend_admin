-- Insert roles directly (AUTO_INCREMENT handles IDs)
INSERT INTO role (name)
VALUES
('super admin'),
('admin'),
('customer');

-- Insert users
INSERT INTO user (name, lastname, email, password, role_fk, createdAt, updatedAt)
VALUES
('John', 'Doe', 'john.doe@superadmin.com', SHA2('password', 256), 1, NOW(), NOW()),
('Jane', 'Smith', 'jane.smith@admin.com', SHA2('password', 256), 2, NOW(), NOW()),
('Bob', 'Brown', 'bob.brown@customer.com', SHA2('password', 256), 3, NOW(), NOW());

INSERT INTO media (name)
VALUES
('Podcast'),
('Webinar'),
('Film'),
('Music');

-- Insert genres
INSERT INTO genre (name)
VALUES
('Comedy'),
('Educational'),
('Action'),
('Drama');

-- Insert platforms
INSERT INTO platform (link)
VALUES
('YouTube podcasts'),
('Spotify podcasts'),
('Apple podcasts'),
('Danmarks radio podcasts'),
('Andre podcasts');

-- Create temporary table for review insertion (alternative to @variable table)
CREATE TEMPORARY TABLE temp_users AS
SELECT id FROM user;

-- Insert reviews with random values
INSERT INTO review (media_fk, title, description, platform_fk, user_fk, createdAt, updatedAt, isBlocked)
SELECT
    (FLOOR(1 + RAND() * 4)) AS media_fk,  -- Random media_fk
    CONCAT('Review Title ', id) AS title,
    CONCAT('This is a sample review for media ', FLOOR(1 + RAND() * 4)) AS description,
    (FLOOR(1 + RAND() * 4)) AS platform_fk,  -- Random platform_fk
    id AS user_fk,
    NOW() AS createdAt,
    NOW() AS updatedAt,
    0 AS isBlocked
FROM temp_users;

-- Create temporary table for reviews
CREATE TEMPORARY TABLE temp_reviews AS
SELECT id FROM review;

-- Insert review genres with random assignment
INSERT INTO review_genres (review_fk, genre_fk)
SELECT
    R.id AS review_fk,
    (FLOOR(1 + RAND() * 4)) AS genre_fk  -- Random genre_fk
FROM temp_reviews R;

-- Insert review actions
INSERT INTO review_actions (user_fk, review_fk, review_gesture, createdAt, updatedAt)
SELECT
    U.id AS user_fk,
    R.id AS review_fk,
    IF(RAND() < 0.5, 1, 0) AS review_gesture,  -- Random like/dislike
    NOW() AS createdAt,
    NOW() AS updatedAt
FROM temp_users U
CROSS JOIN temp_reviews R;

-- Drop temporary tables
DROP TEMPORARY TABLE temp_users;
DROP TEMPORARY TABLE temp_reviews;
