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

-- Requests
-- Create the admins table
CREATE TABLE admins (
    admin_id INT PRIMARY KEY NOT NULL,
    firstname VARCHAR(50) NULL,
    lastname VARCHAR(50) NULL,
    dob DATE NULL,
    address VARCHAR(100) NULL,
    email VARCHAR(100) NULL,
    contact VARCHAR(20) NULL,
    password VARCHAR(50) NULL
);

-- Create the users table
CREATE TABLE users (
    user_id INT PRIMARY KEY IDENTITY(1,1),  
    firstname NVARCHAR(50) NOT NULL,        
    lastname NVARCHAR(50) NOT NULL,         
    dob DATE NOT NULL,                      
    address NVARCHAR(255) NOT NULL,         
    email NVARCHAR(100) NOT NULL,           
    contact NVARCHAR(15) NOT NULL,          
    password NVARCHAR(255) NOT NULL,        
    dietaryrestrictions NVARCHAR(MAX) NULL, 
    intolerances NVARCHAR(MAX) NULL,        
    excludedingredients NVARCHAR(MAX) NULL  
);

-- Create the volunteers table
CREATE TABLE volunteers (
    volunteer_id INT PRIMARY KEY IDENTITY(1,1),  
    firstname NVARCHAR(50) NOT NULL,             
    lastname NVARCHAR(50) NOT NULL,              
    dob DATE NOT NULL,                           
    address NVARCHAR(255) NOT NULL,              
    email NVARCHAR(100) NOT NULL,                
    contact NVARCHAR(15) NOT NULL,               
    password NVARCHAR(255) NOT NULL              
);

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
    CONSTRAINT FK_User FOREIGN KEY (user_id) REFERENCES users(user_id),  
    CONSTRAINT FK_Volunteer FOREIGN KEY (volunteer_id) REFERENCES volunteers(volunteer_id),
    CONSTRAINT FK_Admin FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
);

-- Create the ingredients table
CREATE TABLE ingredients (
    ingredient_id INT PRIMARY KEY IDENTITY(1,1),  
    name NVARCHAR(100) NOT NULL                   
);

-- Create the request_ingredients table
CREATE TABLE request_ingredients (
    request_id INT NOT NULL,                       
    ingredient_id INT NOT NULL,                    
    PRIMARY KEY (request_id, ingredient_id),       
    CONSTRAINT FK_Request FOREIGN KEY (request_id) REFERENCES requests(request_id),  
    CONSTRAINT FK_Ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id)  
);

-- Insert data into admins
INSERT INTO admins (admin_id, firstname, lastname, dob, address, email, contact, password) VALUES
(1, 'John', 'Doe', '1980-01-01', '123 Main St', 'john.doe@example.com', '1234567890', 'password123'),
(2, 'Jane', 'Smith', '1990-02-02', '456 Elm St', 'jane.smith@example.com', '0987654321', 'password456'),
(3, 'Janett', 'Snow', '1990-04-03', '456 Maine St', 'janett.snow@example.com', '0897632143', 'password4321');

-- Insert data into the users table
INSERT INTO users (firstname, lastname, dob, address, email, contact, password, dietaryrestrictions, intolerances, excludedingredients)
VALUES 
('John', 'Doe', '1985-01-15', '123 Main St, Anytown, USA', 'john.doe@example.com', '555-1234', 'password123', 'Vegan', 'Gluten', 'Peanuts'),
('Jane', 'Smith', '1990-05-20', '456 Oak St, Sometown, USA', 'jane.smith@example.com', '555-5678', 'password456', 'Vegetarian', 'Lactose', 'Shellfish'),
('Alice', 'Johnson', '1978-09-10', '789 Pine St, Yourtown, USA', 'alice.johnson@example.com', '555-9101', 'password789', 'None', 'None', 'None');

-- Insert data into the volunteers table
INSERT INTO volunteers (firstname, lastname, dob, address, email, contact, password)
VALUES 
('Emily', 'Brown', '1982-03-12', '123 Maple St, Newcity, USA', 'emily.brown@example.com', '555-1122', 'volunteer123'),
('Michael', 'Davis', '1975-11-05', '456 Birch St, Oldtown, USA', 'michael.davis@example.com', '555-3344', 'volunteer456'),
('Sarah', 'Miller', '1988-07-25', '789 Cedar St, Anycity, USA', 'sarah.miller@example.com', '555-5566', 'volunteer789');

-- Insert data into the ingredients table
INSERT INTO ingredients (name)
VALUES 
('Tomatoes'),
('Lettuce'),
('Bread');

-- Insert data into the requests table
INSERT INTO requests (title, category, description, user_id, volunteer_id, isCompleted, admin_id)
VALUES 
('Urgent food request', 'Urgent', 'Require immediate food, preferably meat', 1, 2, 1, 3),
('Liquids Please', 'Low Priority', 'Require liquids like water, plus protein powder', 2, 2, 0, NULL),
('Baked Goods', 'High Priority', 'I need some baked goods for meals', 3, NULL, 0, NULL);

-- Insert data into the request_ingredients table
INSERT INTO request_ingredients (request_id, ingredient_id)
VALUES 
(1, 1),
(1, 2),
(2, 3);
