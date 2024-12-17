-- Drop tables if they already exist
IF OBJECT_ID('review_actions', 'U') IS NOT NULL DROP TABLE review_actions;
IF OBJECT_ID('review_genres', 'U') IS NOT NULL DROP TABLE review_genres;
IF OBJECT_ID('review', 'U') IS NOT NULL DROP TABLE review;
IF OBJECT_ID('genre', 'U') IS NOT NULL DROP TABLE genre;
IF OBJECT_ID('platform', 'U') IS NOT NULL DROP TABLE platform;
IF OBJECT_ID('media', 'U') IS NOT NULL DROP TABLE media;
IF OBJECT_ID('[user]', 'U') IS NOT NULL DROP TABLE [user];
IF OBJECT_ID('role', 'U') IS NOT NULL DROP TABLE role;

-- Create the Role table
CREATE TABLE role (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(20) NOT NULL
);

-- Create the User table
CREATE TABLE [user] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    lastname NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    role_fk INT,
    verification_key NVARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    deletedAt DATETIME NULL,
    verifiedAt DATETIME NULL,
    isBlocked BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (role_fk) REFERENCES role (id)
);

-- Create the Media table
CREATE TABLE media (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(10) NOT NULL
);

-- Create the Platform table
CREATE TABLE platform (
    id INT IDENTITY(1,1) PRIMARY KEY,
    link NVARCHAR(200) NOT NULL
);

-- Create the Genre table
CREATE TABLE genre (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(20) NOT NULL
);

-- Create the Review table
CREATE TABLE review (
    id INT IDENTITY(1,1) PRIMARY KEY,
    media_fk INT NOT NULL,
    title NVARCHAR(50) NOT NULL,
    description NVARCHAR(750) NOT NULL,
    platform_fk INT NOT NULL,
    user_fk INT NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    deletedAt DATETIME NULL,
    isBlocked BIT DEFAULT 0,
    FOREIGN KEY (media_fk) REFERENCES media (id),
    FOREIGN KEY (platform_fk) REFERENCES platform (id),
    FOREIGN KEY (user_fk) REFERENCES [user] (id)
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
    review_gesture BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (user_fk, review_fk),
    FOREIGN KEY (user_fk) REFERENCES [user] (id),
    FOREIGN KEY (review_fk) REFERENCES review (id)
);
