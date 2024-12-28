-- Create Database
CREATE DATABASE stohtpsd_company;

-- Use the Database
USE stohtpsd_company;


-- Create the Role table
CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);

-- Create the User table
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_fk INT,
    verification_key VARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt DATETIME NULL,
    verifiedAt DATETIME NULL,
    isBlocked BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (role_fk) REFERENCES role (id)
);

-- Create the Media table
CREATE TABLE media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(10) NOT NULL
);

-- Create the Platform table
CREATE TABLE platform (
    id INT AUTO_INCREMENT PRIMARY KEY,
    link VARCHAR(200) NOT NULL
);

-- Create the Genre table
CREATE TABLE genre (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);

-- Create the Review table
CREATE TABLE review (
    id INT AUTO_INCREMENT PRIMARY KEY,
    media_fk INT NOT NULL,
    title VARCHAR(50) NOT NULL,
    description VARCHAR(750) NOT NULL,
    platform_fk INT NOT NULL,
    user_fk INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt DATETIME NULL,
    isBlocked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (media_fk) REFERENCES media (id),
    FOREIGN KEY (platform_fk) REFERENCES platform (id),
    FOREIGN KEY (user_fk) REFERENCES user (id)
);

-- Create the ReviewGenres table (junction table for Review and Genre)
CREATE TABLE review_genres (
    review_fk INT NOT NULL,
    genre_fk INT NOT NULL,
    PRIMARY KEY (review_fk, genre_fk),
    FOREIGN KEY (review_fk) REFERENCES review (id),
    FOREIGN KEY (genre_fk) REFERENCES genre (id)
);

-- Create the ReviewActions table (junction table for User and Review)
CREATE TABLE review_actions (
    user_fk INT NOT NULL,
    review_fk INT NOT NULL,
    review_gesture BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_fk, review_fk),
    FOREIGN KEY (user_fk) REFERENCES user (id),
    FOREIGN KEY (review_fk) REFERENCES review (id)
);
