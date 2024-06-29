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
