-- Step 1: Delete the database if it exists and create a new one
CREATE DATABASE stohtpsd_company;
USE stohtpsd_company;

-- Step 2: Drop tables if they already exist (to avoid conflicts)
DROP TABLE IF EXISTS review_actions;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS role;

-- Step 3: Create the tables and define the relationships

-- Table: role
CREATE TABLE role (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Table: users
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    lastname VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_fk INT UNSIGNED,
    FOREIGN KEY (role_fk) REFERENCES role(id) ON DELETE SET NULL
);

-- Table: media
CREATE TABLE media (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    youtube VARCHAR(255),
    podcast VARCHAR(255),
    book VARCHAR(255)
);

-- Table: reviews
CREATE TABLE reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    media_fk INT UNSIGNED,
    title VARCHAR(255),
    description VARCHAR(255),
    user_fk INT UNSIGNED NOT NULL,
    FOREIGN KEY (media_fk) REFERENCES media(id) ON DELETE SET NULL,
    FOREIGN KEY (user_fk) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: review_actions
CREATE TABLE review_actions (
    action_user_fk INT UNSIGNED NOT NULL,
    action_review_fk INT UNSIGNED NOT NULL,
    action_gesture INT UNSIGNED NOT NULL,
    FOREIGN KEY (action_user_fk) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (action_review_fk) REFERENCES reviews(id) ON DELETE CASCADE
);
