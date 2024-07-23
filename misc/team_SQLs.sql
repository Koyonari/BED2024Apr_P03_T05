-- Drop existing tables if they exist
DROP TABLE IF EXISTS RequestIngredients;
DROP TABLE IF EXISTS UserRecipes;
DROP TABLE IF EXISTS RecipeIngredients;
DROP TABLE IF EXISTS Recipes;
DROP TABLE IF EXISTS PantryIngredient;
DROP TABLE IF EXISTS Ingredients;
DROP TABLE IF EXISTS Pantry;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS Users;

-- Create User Table
CREATE TABLE Users (
    user_id CHAR(24) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
      CONSTRAINT chk_user_id_format_users CHECK (user_id LIKE '[a-fA-F0-9]%' AND LEN(user_id) = 24)
);

-- Sample Data for Users Table
INSERT INTO Users (user_id, username) VALUES 
('669ab53e52ed8860e2afe76b', 'TestVolunteer'),
('669ab54752ed8860e2afe76e', 'TestUserWithSQL'),
('669ab56a52ed8860e2afe771', 'TestUserAdmin'),
('669abb1ffe3958443cdc03e1', 'TestUser'),
('668104e73662e3dda4c190e0', 'TestVolunteer'),
('669abb50fe3958443cdc03e4', 'VolunteerYS'),
('668104e73662e3dda4c190e2', 'TestAdmin'),
('667feba5b8086ea59d41f0b3', 'TestAdmin');

-- Create Pantry Table
CREATE TABLE Pantry (
    pantry_id VARCHAR(5) PRIMARY KEY,
    user_id CHAR(24) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT chk_pantry_id_format_pantry CHECK (pantry_id LIKE '[A-Za-z]%' AND LEN(pantry_id) = 5),
    CONSTRAINT chk_user_id_format_pantry CHECK (user_id LIKE '[a-fA-F0-9]%' AND LEN(user_id) = 24)
);

-- Sample Data for Pantry with actual users
INSERT INTO Pantry (pantry_id, user_id) VALUES 
('Xy21z', '669ab53e52ed8860e2afe76b'),
('oTx5s', '669ab54752ed8860e2afe76e'),
('eF7Mq', '669abb1ffe3958443cdc03e1');

-- Create Ingredients Table
CREATE TABLE Ingredients (
    ingredient_id VARCHAR(10) PRIMARY KEY,
    ingredient_image VARCHAR(255) NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
   CONSTRAINT chk_ingredient_id_format_ingredients CHECK (ingredient_id LIKE '[0-9]%' AND LEN(ingredient_id) <= 10)
);

-- Sample Data for Ingredients Table
INSERT INTO Ingredients (ingredient_id, ingredient_image, ingredient_name) VALUES 
('10115261', 'fish-fillet.jpg', 'fish'),
('5062', 'chicken-breasts.png', 'chicken breast');

-- Create PantryIngredient Table
CREATE TABLE PantryIngredient (
    pantry_id VARCHAR(5) NOT NULL,
    ingredient_id VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (pantry_id) REFERENCES Pantry(pantry_id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(ingredient_id),
    PRIMARY KEY (pantry_id, ingredient_id),
    CONSTRAINT chk_pantry_id_format_pantryingredient CHECK (pantry_id LIKE '[A-Za-z]%' AND LEN(pantry_id) = 5),
    CONSTRAINT chk_ingredient_id_format_pantryingredient CHECK (ingredient_id LIKE '[0-9]%' AND LEN(ingredient_id) <= 10)
);

-- Sample Data for PantryIngredient Table
INSERT INTO PantryIngredient (pantry_id, ingredient_id, quantity) VALUES 
('oTx5s', '5062', 4),
('Xy21z', '10115261', 10),
('eF7Mq', '10115261', 2);

-- Create Recipes Table
CREATE TABLE Recipes (
    id CHAR(36) PRIMARY KEY,
    spoonacularId VARCHAR(10) NULL,
    title VARCHAR(255) NOT NULL,
    imageurl NVARCHAR(255) NOT NULL,
    servings INT NOT NULL,
    readyInMinutes INT NOT NULL,
    pricePerServing FLOAT NOT NULL,
    CONSTRAINT chk_id_uuid4_format_recipes CHECK (id LIKE '[0-9a-fA-F]%' AND LEN(id) = 36),
    CONSTRAINT chk_spoonacularId_format_recipes CHECK (spoonacularId LIKE '[0-9]%' AND LEN(spoonacularId) <= 10)
);

-- Create RecipeIngredients Table
CREATE TABLE RecipeIngredients (
    recipe_id CHAR(36) NOT NULL,
    ingredient_id VARCHAR(10) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    PRIMARY KEY (recipe_id, ingredient_id),
    CONSTRAINT chk_recipe_id_uuid4_format_recipeingredients CHECK (recipe_id LIKE '[0-9a-fA-F]%' AND LEN(recipe_id) = 36),
    CONSTRAINT chk_ingredient_id_format_recipeingredients CHECK (ingredient_id LIKE '[0-9]%' AND LEN(ingredient_id) <= 10)
);

-- Create UserRecipes Table
CREATE TABLE UserRecipes (    
    user_id CHAR(24) NOT NULL,
    recipe_id CHAR(36) NOT NULL,   
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),    
    FOREIGN KEY (recipe_id) REFERENCES Recipes(id),
    CONSTRAINT chk_user_id_format_userrecipes CHECK (user_id LIKE '[a-fA-F0-9]%' AND LEN(user_id) = 24),
    CONSTRAINT chk_recipe_id_uuid4_format_userrecipes CHECK (recipe_id LIKE '[0-9a-fA-F]%' AND LEN(recipe_id) = 36)
);

-- Create the requests table
CREATE TABLE requests (
    request_id CHAR(24) PRIMARY KEY,  
    title NVARCHAR(255) NOT NULL,              
    category NVARCHAR(100) NOT NULL,           
    description NVARCHAR(MAX) NOT NULL,        
    user_id CHAR(24) NOT NULL,                      
    volunteer_id CHAR(24) NULL,                     
    isCompleted BIT NOT NULL DEFAULT 0,        
    admin_id CHAR(24) NULL,                         
    CONSTRAINT FK_User FOREIGN KEY (user_id) REFERENCES Users(user_id),  
    CONSTRAINT FK_Volunteer FOREIGN KEY (volunteer_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Admin FOREIGN KEY (admin_id) REFERENCES Users(user_id),
    CONSTRAINT chk_request_id_format_requests CHECK (request_id LIKE '[A-Za-z0-9]%' AND LEN(request_id) = 24),
    CONSTRAINT chk_user_id_format_requests CHECK (user_id LIKE '[a-fA-F0-9]%' AND LEN(user_id) = 24),
    CONSTRAINT chk_volunteer_id_format_requests CHECK (volunteer_id LIKE '[a-fA-F0-9]%' AND LEN(volunteer_id) = 24)
);

-- Sample Data for Requests Table
INSERT INTO requests (request_id, title, category, description, user_id, volunteer_id, isCompleted, admin_id) VALUES
('RMwDpaQ6fAXQPuID87sJqOKV', 'Would love some protein', 'Low Priority', 'Would love to have some protein powder for my workouts', '669abb1ffe3958443cdc03e1', '669abb50fe3958443cdc03e4', 0, NULL);

-- Create RequestIngredients Table
CREATE TABLE RequestIngredients (
    request_id CHAR(24) NOT NULL,
    pantry_id VARCHAR(5) NOT NULL,
    ingredient_id VARCHAR(10) NOT NULL,
    PRIMARY KEY (request_id, pantry_id, ingredient_id),
    FOREIGN KEY (request_id) REFERENCES requests(request_id),
    FOREIGN KEY (pantry_id) REFERENCES Pantry(pantry_id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(ingredient_id),
    FOREIGN KEY (pantry_id, ingredient_id) REFERENCES PantryIngredient(pantry_id, ingredient_id),
    CONSTRAINT chk_request_id_format_requestingredients CHECK (request_id LIKE '[A-Za-z0-9]%' AND LEN(request_id) = 24),
    CONSTRAINT chk_pantry_id_format_requestingredients CHECK (pantry_id LIKE '[A-Za-z0-9]%' AND LEN(pantry_id) = 5),
    CONSTRAINT chk_ingredient_id_numeric_requestingredients CHECK (ingredient_id LIKE '[0-9]%' AND LEN(ingredient_id) <= 10)
);

-- Sample Data for RequestIngredients Table
INSERT INTO RequestIngredients (request_id, pantry_id, ingredient_id) VALUES 
('RMwDpaQ6fAXQPuID87sJqOKV', 'Xy21z', '10115261');

-- Select all data from the tables
SELECT * FROM Users;
SELECT * FROM Pantry;
SELECT * FROM Ingredients;
SELECT * FROM PantryIngredient;
SELECT * FROM Recipes;
SELECT * FROM RecipeIngredients;
SELECT * FROM requests;
SELECT * FROM UserRecipes;
