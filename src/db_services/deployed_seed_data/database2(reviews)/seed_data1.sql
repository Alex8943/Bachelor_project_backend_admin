-- Step 1: Check if the `reviews` table exists and drop it if it does
IF OBJECT_ID('reviews', 'U') IS NOT NULL
BEGIN
    DROP TABLE reviews;
    PRINT 'Dropped existing `reviews` table.';
END
ELSE
BEGIN
    PRINT '`reviews` table does not exist. Proceeding to create it.';
END

-- Step 2: Create the `reviews` table
CREATE TABLE reviews (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    media_fk INT NOT NULL,
    title NVARCHAR(50) NOT NULL,
    description NVARCHAR(750) NOT NULL,
    platform_fk INT NOT NULL,
    user_fk INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    deletedAt DATETIME NULL,
    isBlocked BIT NOT NULL DEFAULT 0
);
PRINT '`reviews` table created successfully.';

-- Step 3: Declare variables for seeding
DECLARE @totalReviews INT = 100; -- Total number of reviews to insert
DECLARE @batchSize INT = 1000;      -- Batch size for bulk inserts
DECLARE @currentCount INT = 0;      -- Counter for inserted reviews

-- Step 4: Begin inserting reviews in batches
WHILE @currentCount < @totalReviews
BEGIN
    DECLARE @insertQuery NVARCHAR(MAX) = N'';
    DECLARE @batchCounter INT = 0;

    WHILE @batchCounter < @batchSize AND @currentCount < @totalReviews
    BEGIN
        -- Generate random data for the review
        DECLARE @media_fk INT = ABS(CHECKSUM(NEWID())) % 4 + 1; -- Random between 1 and 4
        DECLARE @platform_fk INT = ABS(CHECKSUM(NEWID())) % 4 + 1; -- Random between 1 and 4
        DECLARE @user_fk INT = ABS(CHECKSUM(NEWID())) % 10000 + 1; -- Random between 1 and 10,000
        DECLARE @title NVARCHAR(50) = LEFT(NEWID(), 50); -- Random string (mock title)
        DECLARE @description NVARCHAR(750) = LEFT(NEWID(), 750); -- Random string (mock description)
        DECLARE @isBlocked BIT = ABS(CHECKSUM(NEWID())) % 2; -- Random 0 or 1

        -- Add the review data to the batch
        SET @insertQuery = @insertQuery + 
            CASE WHEN LEN(@insertQuery) > 0 THEN ',' ELSE '' END +
            N'(' + CAST(@media_fk AS NVARCHAR) + N', ' +
            N'''' + @title + N''', ' +
            N'''' + @description + N''', ' +
            CAST(@platform_fk AS NVARCHAR) + N', ' +
            CAST(@user_fk AS NVARCHAR) + N', ' +
            N'GETDATE(), GETDATE(), ' +
            CAST(@isBlocked AS NVARCHAR) + N')';

        SET @batchCounter = @batchCounter + 1;
        SET @currentCount = @currentCount + 1;
    END;

    -- Execute the batch insert
    IF LEN(@insertQuery) > 0
    BEGIN
        SET @insertQuery = 
            N'INSERT INTO reviews (media_fk, title, description, platform_fk, user_fk, createdAt, updatedAt, isBlocked) VALUES ' + @insertQuery;
        EXEC sp_executesql @insertQuery;
    END;
END;

-- Step 5: Verify the inserted data
SELECT COUNT(*) AS total_reviews FROM reviews;
