-- Disable foreign key checks to allow dropping tables in any order
-- In SQL Server, you may need to drop constraints manually if foreign key constraints exist.

-- Drop all tables if they exist
IF OBJECT_ID('[review_actions]', 'U') IS NOT NULL DROP TABLE [review_actions];
IF OBJECT_ID('[review_genres]', 'U') IS NOT NULL DROP TABLE [review_genres];
IF OBJECT_ID('[review]', 'U') IS NOT NULL DROP TABLE [review];
IF OBJECT_ID('[platform]', 'U') IS NOT NULL DROP TABLE [platform];
IF OBJECT_ID('[media]', 'U') IS NOT NULL DROP TABLE [media];
IF OBJECT_ID('[genre]', 'U') IS NOT NULL DROP TABLE [genre];
IF OBJECT_ID('[user]', 'U') IS NOT NULL DROP TABLE [user];
IF OBJECT_ID('[role]', 'U') IS NOT NULL DROP TABLE [role];
