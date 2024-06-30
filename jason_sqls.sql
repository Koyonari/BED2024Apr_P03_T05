-- Create User Table
CREATE TABLE Users (
    user_id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
);

-- Sample Data for Users Table
INSERT INTO Users (user_id, username) VALUES 
('UID1', 'Bob'),
('UID2', 'John');
('UID3', 'Alice');


-- Create Pantry Table
CREATE TABLE Pantry (
    pantry_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Sample Data for Pantry Table
INSERT INTO Pantry (pantry_id, user_id) VALUES 
('zW234', 'UID1'),
('abcd4', 'UID2');


-- Create Ingredients Table
CREATE TABLE Ingredients (
    ingredient_id VARCHAR(255) PRIMARY KEY,
    ingredient_name VARCHAR(255) NOT NULL
);

-- Sample Data for Ingredients Table
INSERT INTO Ingredients (ingredient_id, ingredient_name) VALUES 
('10115261', 'fish'),
('11529', 'tomato'),
('13926', 'beef tenderloin'),
('23003', 't bone steak'),
('7961', 'sliced chicken breast');



-- Create PantryIngredient Table
CREATE TABLE PantryIngredient (
    pantry_id VARCHAR(255) NOT NULL,
    ingredient_id VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (pantry_id) REFERENCES Pantry(pantry_id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(ingredient_id),
    PRIMARY KEY (pantry_id, ingredient_id)
);

INSERT INTO PantryIngredient (pantry_id, ingredient_id,quantity) VALUES 
INSERT INTO PantryIngredient (pantry_id, ingredient_id, quantity) VALUES 
('zW234', '10115261', 2),
('zW234', '11529', 3),
('abcd4', '13926', 1),
('abcd4', '23003', 4),
('abcd4', '7961', 5);



