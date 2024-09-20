-- Use the stohtpsd_company database
USE stohtpsd_company;

-- Step 1: Check if the roles exist and delete them
DELETE FROM role WHERE name IN ('Super admin', 'Admin', 'Customer');

-- Step 2: Insert the roles into the role table
INSERT INTO role (name) VALUES 
    ('Super admin'),  -- Full CRUD on all tables
    ('Admin'),        -- CRUD on users, reviews, media, and review actions, but only READ on the rest
    ('Customer');     -- CRUD on reviews, review actions, but only READ on the rest

-- Optional: Verify insertion
SELECT * FROM role;
