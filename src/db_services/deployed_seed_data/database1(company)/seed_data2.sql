-- Enable identity insert for manual insertion of IDs where necessary
SET IDENTITY_INSERT role ON;

-- Insert roles
INSERT INTO role (id, name)
VALUES
(1, 'super admin'),
(2, 'admin'),
(3, 'customer');

SET IDENTITY_INSERT role OFF;

-- Insert users
DECLARE @Users TABLE (id INT, firstName NVARCHAR(50), lastName NVARCHAR(50), email NVARCHAR(100), role_fk INT);
INSERT INTO [user] (name, lastname, email, password, role_fk, createdAt, updatedAt)
OUTPUT INSERTED.id, INSERTED.name, INSERTED.lastname, INSERTED.email, INSERTED.role_fk INTO @Users
VALUES
('John', 'Doe', 'john.doe@superadmin.com', HASHBYTES('SHA2_256', 'password'), 1, GETDATE(), GETDATE()),
('Jane', 'Smith', 'jane.smith@admin.com', HASHBYTES('SHA2_256', 'password'), 2, GETDATE(), GETDATE()),
('Bob', 'Brown', 'bob.brown@customer.com', HASHBYTES('SHA2_256', 'password'), 3, GETDATE(), GETDATE());

-- Insert media
INSERT INTO media (name)
VALUES
('Book'),
('Movie'),
('Podcast'),
('Video Game');

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
('https://example.com/platform1'),
('https://example.com/platform2'),
('https://example.com/platform3'),
('https://example.com/platform4');

-- Insert reviews
DECLARE @Reviews TABLE (id INT, user_fk INT);
INSERT INTO review (media_fk, title, description, platform_fk, user_fk, createdAt, updatedAt, isBlocked)
OUTPUT INSERTED.id, INSERTED.user_fk INTO @Reviews
SELECT
    (ROW_NUMBER() OVER (ORDER BY NEWID()) % 4) + 1 AS media_fk, -- Random media_fk
    CONCAT('Review Title ', ROW_NUMBER() OVER (ORDER BY NEWID())) AS title,
    CONCAT('This is a sample review for media ', (ROW_NUMBER() OVER (ORDER BY NEWID()) % 4) + 1) AS description,
    (ROW_NUMBER() OVER (ORDER BY NEWID()) % 4) + 1 AS platform_fk, -- Random platform_fk
    id AS user_fk,
    GETDATE() AS createdAt,
    GETDATE() AS updatedAt,
    0 AS isBlocked
FROM @Users;

-- Insert review genres
INSERT INTO review_genres (review_fk, genre_fk)
SELECT DISTINCT
    R.id AS review_fk,
    (ROW_NUMBER() OVER (ORDER BY NEWID()) % 4) + 1 AS genre_fk -- Random genre_fk
FROM @Reviews R;

-- Insert review actions
INSERT INTO review_actions (user_fk, review_fk, review_gesture, createdAt, updatedAt)
SELECT DISTINCT
    U.id AS user_fk,
    R.id AS review_fk,
    CASE WHEN (ROW_NUMBER() OVER (ORDER BY NEWID()) % 2) = 0 THEN 1 ELSE 0 END AS review_gesture, -- Random like/dislike
    GETDATE() AS createdAt,
    GETDATE() AS updatedAt
FROM @Users U
CROSS JOIN @Reviews R;
