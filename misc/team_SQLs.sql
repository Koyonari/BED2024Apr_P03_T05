-- Create User Table
CREATE TABLE Users (
    user_id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
);

-- Sample Data for Users Table // This is just a sample data
INSERT INTO Users (user_id, username) VALUES 
('669ab53e52ed8860e2afe76b', 'TestVolunteer'),
('669ab54752ed8860e2afe76e', 'TestUserWithSQL'),
('669ab56a52ed8860e2afe771', 'TestUserAdmin');
('669abb1ffe3958443cdc03e1', 'TestUser'),
('668104e73662e3dda4c190e0', 'TestVolunteer'),
('669abb50fe3958443cdc03e4', 'VolunteerYS'),
('668104e73662e3dda4c190e2', 'TestAdmin'),
('667feba5b8086ea59d41f0b3', 'TestAdmin');

-- Create Pantry Table
CREATE TABLE Pantry (
    pantry_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Sample data for Pantry with actual users
INSERT INTO Pantry (pantry_id, user_id) VALUES 
('Xy21z', '669ab53e52ed8860e2afe76b'),
('oTx5s', '669ab54752ed8860e2afe76e'),
('eF7Mq', '669abb1ffe3958443cdc03e1');

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
('Xy21z', '10115261', 10),
('eF7Mq', '10115261', 2);

-- Create Recipes Table
CREATE TABLE Recipes (
    id VARCHAR(255) PRIMARY KEY,
    spoonacularId VARCHAR(255) NULL,
    title VARCHAR(255) NOT NULL,
    imageurl NVARCHAR(255) NOT NULL,
    servings INT NOT NULL,
    readyInMinutes INT NOT NULL,
    pricePerServing FLOAT NOT NULL
);

-- Create RecipeIngredients Table
CREATE TABLE RecipeIngredients (
    recipe_id VARCHAR(255) NOT NULL,
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

-- Create the requests table
CREATE TABLE requests (
    request_id VARCHAR(24) PRIMARY KEY,  
    title NVARCHAR(255) NOT NULL,              
    category NVARCHAR(100) NOT NULL,           
    description NVARCHAR(MAX) NOT NULL,        
    user_id VARCHAR(255) NOT NULL,                      
    volunteer_id VARCHAR(255) NULL,                     
    isCompleted BIT NOT NULL DEFAULT 0,        
    admin_id VARCHAR(255) NULL,                         
    CONSTRAINT FK_User FOREIGN KEY (user_id) REFERENCES Users(user_id),  
    CONSTRAINT FK_Volunteer FOREIGN KEY (volunteer_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Admin FOREIGN KEY (admin_id) REFERENCES Users(user_id)
);

INSERT INTO requests (request_id, title, category, description, user_id, volunteer_id, isCompleted, admin_id) VALUES
('RMwDpaQ6fAXQPuID87sJqOKV', 'Would love some protein', 'Low Priority', 'Would love to have some protein powder for my workouts', '669abb1ffe3958443cdc03e1', '669abb50fe3958443cdc03e4', 0, NULL);

CREATE TABLE RequestIngredients (
    reqing_id VARCHAR(255) PRIMARY KEY,
    request_id VARCHAR(24) NOT NULL,
    pantry_id VARCHAR(255) NULL,
    ingredient_id VARCHAR(255) NULL,
    FOREIGN KEY (request_id) REFERENCES requests(request_id),
    FOREIGN KEY (pantry_id) REFERENCES Pantry(pantry_id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(ingredient_id),
    FOREIGN KEY (pantry_id, ingredient_id) REFERENCES PantryIngredient(pantry_id, ingredient_id)
);

-- Example insert statement
INSERT INTO RequestIngredients (reqing_id, request_id, pantry_id, ingredient_id) VALUES 
('231321421321', 'RMwDpaQ6fAXQPuID87sJqOKV', 'Xy21z', '10115261');

SELECT * FROM Users;
SELECT * FROM Pantry;
SELECT * FROM Ingredients;
SELECT * FROM PantryIngredient;
SELECT * FROM Recipes;
SELECT * FROM RecipeIngredients;
SELECT * FROM requests;
SELECT * FROM UserRecipes;