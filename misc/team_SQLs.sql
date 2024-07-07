-- Create User Table
CREATE TABLE Users (
    user_id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
);

-- Sample Data for Users Table // This is just a sample data
INSERT INTO Users (user_id, username) VALUES 
('668105073662e3dda4c190e3', 'TestUser'),
('668104e73662e3dda4c190e0', 'TestVolunteer');


-- Create Pantry Table
CREATE TABLE Pantry (
    pantry_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Sample data for Pantry with actual users
INSERT INTO Pantry (pantry_id, user_id) VALUES 
('Xy21z', '668105073662e3dda4c190e3'),
('oTx5s', '668104e73662e3dda4c190e0');

-- Create Ingredients Table
CREATE TABLE Ingredients (
    ingredient_id VARCHAR(255) PRIMARY KEY,
    ingredient_image VARCHAR(255) NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
);

-- Sample Data for Ingredients Table
INSERT INTO Ingredients (ingredient_id, ingredient_image, ingredient_name) VALUES 
('10115261', 'fish-fillet.jpg', 'fish'),
('5062', 'chicken-breasts.png', 'chicken breast');

-- Create PantryIngredient Table
CREATE TABLE PantryIngredient (
    pantry_id VARCHAR(255) NOT NULL,
    ingredient_id VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (pantry_id) REFERENCES Pantry(pantry_id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(ingredient_id),
    PRIMARY KEY (pantry_id, ingredient_id)
);

INSERT INTO PantryIngredient (pantry_id, ingredient_id, quantity) VALUES 
('oTx5s', '5062', 4),
('Xy21z', '10115261', 10);


-- Create Recipes Table
CREATE TABLE Recipes (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    imageurl NVARCHAR(255) NOT NULL,
    servings INT NOT NULL,
    readyInMinutes INT NOT NULL,
    pricePerServing FLOAT NOT NULL
);

-- Create RecipeIngredients Table
CREATE TABLE RecipeIngredients (
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- Create UserRecipes Table
CREATE TABLE UserRecipes (    
    user_id VARCHAR(255) NOT NULL,
    recipe_id VARCHAR(255) NOT NULL,   
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),    
    FOREIGN KEY (recipe_id) REFERENCES Recipes(id),
);

SELECT * FROM Users;
SELECT * FROM Pantry;
SELECT * FROM Ingredients;
SELECT * FROM PantryIngredient;
SELECT * FROM Recipes;
SELECT * FROM RecipeIngredients;

-- Create the requests table
CREATE TABLE requests (
    request_id INT PRIMARY KEY IDENTITY(1,1),  
    title NVARCHAR(255) NOT NULL,              
    category NVARCHAR(100) NOT NULL,           
    description NVARCHAR(MAX) NOT NULL,        
    user_id INT NOT NULL,                      
    volunteer_id INT NULL,                     
    isCompleted BIT NOT NULL DEFAULT 0,        
    admin_id INT NULL,                         
    CONSTRAINT FK_User FOREIGN KEY (user_id) REFERENCES Users(user_id),  
    CONSTRAINT FK_Volunteer FOREIGN KEY (volunteer_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Admin FOREIGN KEY (admin_id) REFERENCES admins Users(user_id)
);

-- Insert data into the requests table
INSERT INTO requests (title, category, description, user_id, volunteer_id, isCompleted, admin_id)
VALUES 
('Urgent food request', 'Urgent', 'Require immediate food, preferably meat', 1, 2, 1, 3),
('Liquids Please', 'Low Priority', 'Require liquids like water, plus protein powder', 2, 2, 0, NULL),
('Baked Goods', 'High Priority', 'I need some baked goods for meals', 3, NULL, 0, NULL);