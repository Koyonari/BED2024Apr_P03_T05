# BED2024Apr_P03_T05
BED 2024 Assignment

# NutriAid

## Team Members
- **Yeo Jin Rong** - S10258457
- **An Yong Shyan** - S10258126
- **Ng Kai Huat Jason** - S10262552

## Introduction
We are Team 5 from P03. This repository is for our BED assignment project, NutriAid.

NutriAid is a web application designed to bridge the gap between underprivileged individuals and volunteers willing to provide food aid.

## Objective
The platform facilitates efficient and organised distribution of food resources by allowing users to post their requests for help in a forum-like manner, which volunteers are able to accept and fulfil. This will be achieved through three main goals:
1. Provide a way to allow underprivileged individuals to post requests asking for food.
2. Facilitate volunteers in finding and fulfilling these requests.
3. Ensure efficient and organized distribution of food resources.

## CRUD Operations
Below we have listed the CRUD Operations performed by each member:

### Yeo Jin Rong
### 1. Account Registration

- **Method:** POST
- **Request URL:** `http://localhost:3500/register`
- **Description:** Creates an account, either as a Volunteer or User, seperate specific request(s) for new users

#### Example Request Body for Volunteer:

```json
{
    "username": "TestVolunteer",
    "password": "TestVolunteer123!",
    "firstname": "Volunteer",
    "lastname": "TestAccount",
    "roles": {
        "Volunteer": 2002
    },
    "address": "Ngee Ann Polytechnic",
    "email": "Volunteer@gmail.com",
    "contact": "97346328",
    "dateOfBirth": "2024-06-06"
}
```
#### Example Request Body for User:
```json
{
  "username": "TestUser",
  "password": "User123!",
  "firstname": "Test",
  "lastname":"User",
  "roles": {
    "User": 2001
  },
  "address": "123 Main St",
  "email": "john.doe@example.com",
  "contact": "12345678",
  "dateOfBirth": "2024-06-06",
  "dietaryRestrictions": ["Pescetarian", "Paleo"],
  "intolerances": ["Sesame", "Shellfish"],
  "excludedIngredients": ["fish", "chicken", "beef"]
}
```
#### Example Successful Response Body:
```json
{
    "success": "New user TestUser1 created!"
}
```
- Status 201 Created
  
#### Example Errorneous Response:
- User has input a non-unique email
``` json
{
    "message": "E11000 duplicate key error collection: CompanyDB.users index: email_1 dup key: { email: \"john.doe@example.com\" }"
}
```
- Status 500 Internal Server Error
  
##### User has not fufilled all required inputs
``` json
{
    "message": "Username, password, email, and contact are required."
}
```
- Status 400 Bad Request
  
##### User has input a username that is already pre-existing
``` json
{
    "message": "Username already exists."
}
```
- Status 409 Conflict
  
### 2. Authenthication (Login)

- **Method:** POST
- **Request URL:** `http://localhost:3500/auth`
- **Description:** Authenthication of account by username and password (login functionaility), provides a JWT (jsonwebtoken) as well as adding refreshToken into MongoDB

##### Example Request Body for Login:
```json
{
	"username": "TestUser",
	"password": "User123!"
}
```

#### Example Succesful Request Response for Login:
```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJ1c2VyaWQiOiI2NjdmZWM1OTRmYWM2MjA5NzI1ODA2MzYiLCJ1c2VybmFtZSI6IlRlc3RVc2VyIiwicm9sZXMiOlsyMDAxXX0sImlhdCI6MTcxOTY3MDAwOCwiZXhwIjoxNzE5NjczNjA4fQ.aFcJX7ZhnJ_YytFMSdW12HqK8W5U-_K5kVQNwSJAslA"
}
```
- JsonWebToken will also be added as a cookie
- Status 200 OK

#### Example Errorneous Response:

##### User has not input password
```json
{
    "message": "Username and password are required."
}
```
- Status 400 Bad Request

##### User input wrong password or wrong username
```json
{
    "message": "Invalid username or password."
}
```
- Status 401 Unauthorised

### 3. Refresh JWT Token

- **Method:** GET
- **Request URL:** `http://localhost:3500/refresh`
- **Description:** Refreshes JSON Web Token for User, updates database with new refreshToken

#### Example Request Body for Refresh Token:
```
N/A request is the JWT cookie itself
```

#### Example Successful Response Body for Refresh Token:
```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJ1c2VyaWQiOiI2NjdmZWM1OTRmYWM2MjA5NzI1ODA2MzYiLCJyb2xlcyI6WzIwMDFdfSwiaWF0IjoxNzE5NjcwODgwLCJleHAiOjE3MTk2NzQ0ODB9.hgWn5G23hMolK1GHDIQ31921NNvwbLQtjn2wCEWJVfM"
}
```
- Status 200 OK

#### Example Errorneous Response Body for Refresh Token:

##### User has no JWT cookie
```json
{
    "message": "Unauthorized: No refreshToken cookie found"
}
```
- Status 401 Unauthorized

### 4. Logout

- **Method:** GET
- **Request URL:** `http://localhost:3500/logout`
- **Description:** Removes refreshtoken parameter in MongoDB database

```
No request body
No response body
```

### 5. Get All Users

- **Method:** GET
- **Request URL:** `http://localhost:3500/users`
- **Description:** Retrieve information of all users
- **Authentication:** JsonWebToken

#### Example Request Body for getAllUsers:
```
N/A request is the JWT cookie itself
```

#### Example Successful Response Body for getAllUsers:
```json
{
    [
    {
        "_id": "667feba5b8086ea59d41f0b3",
        "username": "Admin123",
        "roles": {
            "Admin": 2003
        },
        "address": "Pulau Tekong",
        "dietaryRestrictions": [],
        "intolerances": [],
        "excludedIngredients": [],
        "email": "Admin123@gmail.com",
        "contact": "97346328",
        "dateCreated": "2024-06-29T11:10:29.484Z",
        "__v": 0,
    }
```
- This is one object, however after there can be more User objects nested within this array
- Password and refreshToken are sanitised from json object for security

#### Example Errorneous Response Body for getAllUsers:

##### Json Token is invalid or not authorized
```json
{
    "message": "Forbidden: Invalid token"
}
```
- Status 403 Forbidden

###### Json Web Token is missing or invalid format
```json
{
    "message": "Unauthorized: Missing or invalid token format"
}
```
- Status 401 Unauthorized

### 6. Add Users as Admin (createUsers)

- **Method:** POST
- **Request URL:** `http://localhost:3500/users`
- **Description:** Create information for a user, while logged in (this is predominantly an admin function)
- **Authentication:** JsonWebToken, Role Verification

#### Example Request Body for createUser:
```json
{
    "username": "TestVolunteer",
    "password": "TestVolunteer123!",
    "firstname": "Volunteer",
    "lastname": "TestAccount",
    "roles": {
        "Volunteer" : 2002
    },
    "address": "Ngee Ann Polytechnic",
    "email": "Volunteer@gmail.com",
    "contact": "97346328",
    "dateOfBirth": "2024-06-06"
}
```

#### Example Successful Response Body for createUser:
```json
{
    "message": "User TestVolunteer created successfully"
}
```
- Status 201 Created

#### Example Errorneous Response Body for createUser:

##### User is unauthorised (not an admin)
```json
{
    "message": "Forbidden: User does not have permission to access this resource"
}
```
- Status 403 Forbidden

##### User did not input all parameters
```json
{
    "message": "Username, password, email, and contact are required."
}
```
- Status 400 Bad Request

### 7. Get User by ID

- **Method:** GET
- **Request URL:** `http://localhost:3500/users/{id}`
- **Description:** Retrieve information from a specific user, identified by user_id

#### Example Request Body for getUserbyId:
```
No request body, however id is paramaters as req.params.id
JWT Cookie is also required
```

#### Example Successful Response Body for getUserbyId:
```json
{
    "_id": "667fec594fac620972580636",
    "username": "TestUser",
    "roles": {
        "User": 2001
    },
    "address": "123 Main St",
    "dietaryRestrictions": [
        "Pescetarian",
        "Paleo"
    ],
    "intolerances": [
        "Sesame",
        "Shellfish"
    ],
    "excludedIngredients": [
        "fish",
        "chicken",
        "beef"
    ],
    "email": "john.doe@example.com",
    "contact": "12345678",
    "dateCreated": "2024-06-29T11:13:29.097Z",
    "__v": 0
```
- Status 200 OK
- - Password and refreshToken are sanitised from json object for security

#### Example Errorneous Response Body for getUserById:

##### User inputs wrong ID or ID not found
```json
{
    "message": "User ID 667fec594fac620972580633 not found"
}
```
- Status 400 Bad Request

##### User inputs invalid ID
```json
{
    "message": "Internal server error",
    "error": "isValidObjectId is not defined"
}
```
- Status 500 Internal Server Error

### 8. Update user by ID 

- **Method:** PUT
- **Request URL:** `http://localhost:3500/users/{id}`
- **Description:** Update information based on user_id as paramaters, authenthicated as either user themselves or admin, full User object has to be input
- **Authorisation:** JWT Cookie, verified either by Role Authenthication to be an Admin, or the User/Volunteer themselves

#### Example Request Body for updateUser:
```json
{
  "username": "TestUser",
  "password": "User123!",
  "firstname": "PUT user",
  "lastname": "User",
  "roles": {
    "User": 2001
  },
  "address": "123 Main St",
  "email": "john.doe@example.com",
  "contact": "12345678",
  "dateOfBirth": "2024-06-06",
  "dietaryRestrictions": ["Pescetarian", "Paleo"],
  "intolerances": ["Sesame", "Shellfish"],
  "excludedIngredients": ["fish", "chicken", "beef"]
}
```
- Authenthication done by verifyJWT.js and checkAuthorisation.js

#### Example Successful Response Body for updateUser:
```json
{
    "message": "User TestUser updated successfully"
}
```

#### Example of Errorneous Response Body for updateUser:

##### User is attempting to update another user
```json
{
    "message": "Unauthorized to update this user"
}
```
- Status 403 Forbidden

### 9. Edit user by ID 

- **Method:** PATCH
- **Request URL:** `http://localhost:3500/users/{id}`
- **Description:** Edit information based on user_id as paramaters, authenthicated as either user themselves or admin, only edited fields have to be input
- **Authorisation:** JWT Cookie, verified either by Role Authenthication to be an Admin, or the User/Volunteer themselves

#### Example Request Body for updateUser:
```json
{
    "firstname": "UserNameNew"
}
```
- Authenthication done by verifyJWT.js and checkAuthorisation.js

#### Example Successful Response Body for updateUser:
```json
{
    "message": "User updated successfully",
    "editedFields": {
        "firstname": "UserNameNew"
    }
}
```
- Status 200 OK

#### Example of Errorneous Response Body for updateUser:

##### User is attempting to update another user
```json
{
    "message": "Unauthorized to update this user"
}
```
- Status 403 Forbidden

### 10. Delete User by ID

- **Method:** DELETE
- **Request URL:** `http://localhost:3500/users/{id}`
- **Description:** Delete users, only available to admin
- **Authorisation:** JWT Cookie, verified either by Role Authenthication to be an Admin

#### Example Request Body for deleteUser:
```
Verified by JWT
user_id is in paramaeters as req.param.id
```
#### Example Successful Response Body for deleteUser
```json
{
    "message": "User with ID 668020aad98c868f29597fe0 deleted successfully"
}
```
- Status 200 OK

#### Example Errorneous Response Body for deleteUser:

##### Unauthorized User attempts to delete
```json
{
    "message": "Forbidden: Invalid token"
}
```
- Status 403 Forbidden

###### Invalid user ID format
```json
{
    "message": "Invalid user ID format: 668020aad98c868f29597f"
}
```
- Status 400 Bad Request

### 11. Get Recipes based on Pantry

- **Method:** GET
- **Request URL:** `http://localhost:3500/recipes/fetch`
- **Description:** Function to get all available recipes (maximum of 5 per call) based on available pantry
- **Authorisation:** JWT Cookie

#### Example Response Body 
```
N/A Uses JWT Token to retrieve userid
```

### In-Depth Explaination of GetRecipe(s)
This function is quite complex, utilising 4 requests at one go, which will be explained below
This is a "quick-start" button that automatically adds all available recipes based on a user's pantry, ignoring filters.
- Example Error body will be omitted due to nested error handling.

a) GET PantryIngredients
- **Method:** GET
- **Request URL:** `N/A Nested Request`
- **Description:** Function to get all available ingredients in a user's pantry, based on user ID
- **Authorisation:** JWT Cookie
  ```
  This nested request is to getIngredients from the Pantry based on a userID, which is parsed in through the JWT using middleware verifyJWT.
  This request returns an array of ingredients, mapped with ingredientid and ingredient_name as keys
  ```
#### Example Request Body
```
N/A, JWT Token is utilised to obtain userid
```
#### Example Response Body 
```json
[
    {
        "ingredient_id": "10115261",
        "ingredient_name": "fish"
    },
    {
        "ingredient_id": "11529",
        "ingredient_name": "tomato"
    },
    {
        "ingredient_id": "13926",
        "ingredient_name": "beef tenderloin"
    },
    {
        "ingredient_id": "23003",
        "ingredient_name": "t bone steak"
    },
    {
        "ingredient_id": "7961",
        "ingredient_name": "sliced chicken breast"
    }
]
```

b) Fetch Recipes
- **Method:** N/A
- **Request URL:** `N/A Nested Request`
- **Description:** API Request to obtain recipes from spoonacular API
  ```
  This nested request is obtain recipes from spoonacular API. Response body utilises the ingredient_name parameter in previous "GET Pantry Ingredients". Return body is an array of recipes from the API
  ```
#### Example Request Body
```
Input json object here 
```
#### Example Response Body 
```json
{
    "offset": 0,
    "number": 2,
    "results": [
        {
            "id": 716429,
            "title": "Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs",
            "image": "https://img.spoonacular.com/recipes/716429-312x231.jpg",
            "imageType": "jpg",
        },
        {
            "id": 715538,
            "title": "What to make for dinner tonight?? Bruschetta Style Pork & Pasta",
            "image": "https://img.spoonacular.com/recipes/715538-312x231.jpg",
            "imageType": "jpg",
        }
    ],
    "totalResults": 86
}
```
- NOTE: This json object is a snippet of the full documentation, please refer to [Spoonacular API](https://spoonacular.com/food-api/docs#Search-Recipes-Complex) for more information

c) Fetch Recipe Information
- **Method:** N/A
- **Request URL:** `N/A Nested Request`
- **Description:** API Request to obtain recipe information from spoonacular API
  ```
  This nested request is to recieve recipe information for each recipe listed within the array provided in the previous "Fetch Recipes". This will retrieve information such as recipe id, title, imaageurl, servings, readyInMinutes and it's associated ingredients required for each recipe.
  ```
#### Example Request Body 
```
Previous response body parsed directly into this
```
#### Example Response Body
```json
{
    "id": 716429,
    "title": "Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs",
    "image": "https://img.spoonacular.com/recipes/716429-556x370.jpg",
    "imageType": "jpg",
    "servings": 2,
    "readyInMinutes": 45,
    "pricePerServing": 163.15,
    "extendedIngredients": [
        {
```
- NOTE: This json object is a snippet of the full documentation, please refer to [Spoonacular API](https://spoonacular.com/food-api/docs#Get-Recipe-Information) for more information

d) Insert Recipes
- **Method:** N/A
- **Request URL:** `N/A Nested Request`
- **Description:** Insert Recipes into SQL Tables Recipes, RecipeIngredients and Ingredients 
```
This nested request is a 3-stage request to insert values into tables Recipes and Ingredients, in a many-to-many relationship with RecipeIngredients accomodating this relationship
```
i) InsertRecipeDetails 
- **Description:** Inserts into Recipe Table
```
      INSERT INTO Recipes (id, title, imageurl, servings, readyInMinutes, pricePerServing)
      VALUES (@id_insert, @title, @imageurl, @servings, @readyInMinutes, @pricePerServing);
```
ii) InsertRecipeIngredients
- **Description:** Inserts into Ingredients Table first, followed by RecipeIngredients Table, which is linking Recipe to Ingredients in a many-to-many relationship
```
   MERGE INTO Ingredients AS target
      USING (VALUES (@id_insertOrUpdate, @name, @image)) AS source (ingredient_id, ingredient_name, ingredient_image)
      ON target.ingredient_id = source.ingredient_id
      WHEN MATCHED THEN
        UPDATE SET target.ingredient_name = source.ingredient_name, target.ingredient_image = source.ingredient_image
      WHEN NOT MATCHED THEN
        INSERT (ingredient_id, ingredient_name, ingredient_image) VALUES (source.ingredient_id, source.ingredient_name, source.ingredient_image);
```
```
        INSERT INTO RecipeIngredients (recipe_id, ingredient_id, amount, unit)
        VALUES (@recipeId, @ingredientId, @amount, @unit);
```
iii) LinkUserToRecipe
- **Description:** Inserts into UserRecipes, to link Recipe and Users in a many-to-many relationship
```
        INSERT INTO UserRecipes (user_id, recipe_id)
        VALUES (@userId, @recipeId);
```

### 12. Obtain Recipes with Filter and Search

- **Method:** POST
- **Request URL:** `http://localhost:3500/recipes/getfilteredrecipes`
- **Description:** Function to get recipes based on filters stored in database and input ingredients
- **Authorisation:** JWT Cookie

#### Example Request Body 
```json
[
    {
        "ingredient_id": "10115261",
        "ingredient_name": "fish fillets"
   	"ingredient_image": "fish-fillet.jpg"
    },
    {
        "ingredient_id": "11529",
        "ingredient_name": "tomato"
	"ingredient_image": "tomato.jpg"
    }
]
```
- This is a snippet of an Array of Ingredients

#### Example Successful Response Body
```json
[
    {
        "id": "639851",
        "title": "changed",
        "image": "https://img.spoonacular.com/recipes/639851-556x370.jpg",
        "servings": 2,
        "readyInMinutes": 6,
        "pricePerServing": 500
    },
```
- This is a snippet of one recipe object, within an array of recipes
#### Example Errorneous Body:

##### No Recipes stored for User, i.e Array of Recipe length < 0
```json
{
    "message": "No recipes found for the user"
}
```
- Status 404 Not Found

### 13. Get All Recipes based on User ID from Database

- **Method:** GET
- **Request URL:** `http://localhost:3500/recipes/byuser`
- **Description:** Function to get all stored recipes based on user id
- **Authorisation:** JWT Cookie

#### Example Request Body 
```
N/A, JWT Token is utilised to obtain user id
```

#### Example Successful Response Body
```json
[
    {
        "id": 639851,
        "title": "Cod with Tomato-Olive-Chorizo Sauce and Mashed Potatoes",
        "image": "https://img.spoonacular.com/recipes/639851-312x231.jpg",
        "imageType": "jpg"
    },
    {
        "id": 639957,
        "title": "Colorful Tomato and Spinach Seafood Pasta",
        "image": "https://img.spoonacular.com/recipes/639957-312x231.jpg",
        "imageType": "jpg"
    },
```
- This is an array of recipes

#### Example Errorneous Response Body

##### Request Body for Ingredient Object is incorrect
```json
{
    "message": "Each ingredient must have a valid ingredient_name"
}
```
- Status 400 Bad Request

### 14. Get All Recipes within Database

- **Method:** GET
- **Request URL:** `http://localhost:3500/recipes/fetchrecipes`
- **Description:** Function to get all stored recipes in SQL Database
- **Authorisation:** JWT Cookie
- 
#### Example Request Body 
```
N/A, JWT Token is utilised to obtain user id
```

#### Example Successful Response Body
```json
[
    {
        "id": 639851,
        "title": "Cod with Tomato-Olive-Chorizo Sauce and Mashed Potatoes",
        "image": "https://img.spoonacular.com/recipes/639851-312x231.jpg",
        "imageType": "jpg"
    },
    {
        "id": 639957,
        "title": "Colorful Tomato and Spinach Seafood Pasta",
        "image": "https://img.spoonacular.com/recipes/639957-312x231.jpg",
        "imageType": "jpg"
    },
```
- This is an array of recipes

### 15. Insert Recipes into Database

- **Method:** POST
- **Request URL:** `http://localhost:3500/recipes/insertrecipe`
- **Description:** Function to get insert a recipe into database, request body will be an array of recipes
- **Authorisation:** JWT Cookie

#### SQL Code to insert into database
```
      INSERT INTO Recipes (id, title, imageurl, servings, readyInMinutes, pricePerServing)
          VALUES (@id, @title, @imageurl, @servings, @readyInMinutes, @pricePerServing);
```
- Inserts recipe object into recipe table, utilising json request body
```
	INSERT INTO Ingredients (ingredient_id, ingredient_name)
		VALUES (@id, @name);
```
- Inserts ingredients object into ingredients table, it is retrieved from array of ingredients, after calling recipe details
```
         INSERT INTO RecipeIngredients (recipeid, ingredientid)
              VALUES (@recipeid, @ingredientid);
```
- Insert recipe ingredients into recipe ingredients table, mapping from recipe to ingredients in a many to many relationship

#### Example Request Body 
```json
[
    {
        "id": "999999" ,
        "title": "TestRecipePost",
        "image": "https://img.spoonacular.com/recipes/639851-556x370.jpg",
        "servings": 2,
        "readyInMinutes": 6,
        "pricePerServing": 500
    }
]
```

### 16. Update Recipe Details by Recipe ID

- **Method:** PUT
- **Request URL:** `http://localhost:3500/recipes/updaterecipedetails/{id}`
- **Description:** Function to put a new recipe, replacing the old information in the previous recipe object
- **Authorisation:** JWT Cookie

#### Example Request Body
```json

    {
        "id": "639851",
        "title": "changed",
        "image": "https://img.spoonacular.com/recipes/639851-556x370.jpg",
        "servings": 4,
        "readyInMinutes": 6,
        "pricePerServing": 626.14
    }
```
- JSON Request body has all parameters required for recipe object

### 17. Update Recipe Details by Recipe ID (Admin)

- **Method:** PUT
- **Request URL:** `http://localhost:3500/recipes/updaterecipe/639411/{id}`
- **Description:** Function to put a new recipe, replacing the old information in the previous recipe object, this is done by admin, hence no checks for recipe ownership
- **Authorisation:** JWT Cookie

#### Example Request Body
```json

    {
        "id": "639851",
        "title": "changed",
        "image": "https://img.spoonacular.com/recipes/639851-556x370.jpg",
        "servings": 4,
        "readyInMinutes": 6,
        "pricePerServing": 626.14
    }
```
- JSON Request body has all parameters required for recipe object

### 18. Edit Recipe Details by Recipe ID

- **Method:** PATCH
- **Request URL:** `http://localhost:3500/recipes/editrecipedetails/{id}`
- **Description:** Function to patch a recipe, finding by recipe id
- **Authorisation:** JWT Token

#### Example Request Body
```json
   {
        "servings": 2,
        "pricePerServing": 500
    }
```
- Only parameters intended to be patched will be put into the request body

### 19. Edit Recipe Details by Recipe ID [ADMIN]

- **Method:** PATCH
- **Request URL:** `http://localhost:3500/recipes/editrecipebyid/{id}`
- **Description:** Function to patch a recipe, finding by recipe id, this is done by admin, hence no checks for recipe ownership
- **Authorisation:** JWT Token

#### Example Request Body
```json
   {
        "servings": 2,
        "pricePerServing": 500
    }
```
- Only parameters intended to be patched will be put into the request body

### 20. Delete Recipe by ID

- **Method:** DELETE
- **Request URL:** `http://localhost:3500/recipes/deleterecipe/{id}`
- **Description:** Function to delete a recipe, based on ID
- **Authorisation:** JWT Token

#### Example Request Body
```json
N/A, recipe id is from req.params.id
```

### 21. Delete Recipe by ID [ADMIN]

- **Method:** DELETE
- **Request URL:** `http://localhost:3500/recipes/deleterecipebyid/{id}`
- **Description:** Function to delete a recipe, based on ID, this is done by admin, hence no checks for recipe ownership
- **Authorisation:** JWT Tokens

#### Example Request Body
```json
N/A, recipe id is from req.params.id
```
### 22. Get RecipeIngredients by Recipe ID

- **Method:** GET
- **Request URL:** `http://localhost:3500/recipes/fetchingredients/{id}`
- **Description:** Function to retrieve the recipe ingredients associated with a particular recipe.
- **Authorisation:** JWT Token

#### Example Request Body
```json
N/A, recipe id is from req.params.id
```

#### Example Successful Response Body
```json
[
    {
        "ingredient_id": "15076",
        "ingredient_name": "salmon",
        "ingredient_image": "salmon.png"
    }
]
```

### 23. Insert RecipeIngredient by Recipe ID

- **Method:** POST
- **Request URL:** `http://localhost:3500/recipes/insertrecipeingredients/{id}`
- **Description:** Function to insert a recipe ingredient, associated with a particular recipe.
- **Authorisation:** JWT Token

#### Example Request Body
```json
[
    {
        "name": "apples",
        "amount": 2,
        "unit": "slices"
    }
]
```

#### Example Successful Response Body
```json
{
    "message": "Recipe ingredients updated and stored in the database."
}
```

### 24. Delete Recipe Ingredients by Recipe ID

- **Method:** DELETE
- **Request URL:** `http://localhost:3500/recipes/insertrecipeingredients/{id}`
- **Description:** Function to insert a recipe ingredient, associated with a particular recipe.
- **Authorisation:** JWT Token
- 
#### Example Request Body
```json
{
    "ingredient_id": "10115261",
    "ingredient_name": "fish fillets"
}
```

#### Example Successful Response Body
```json
{
   message: "Ingredient deleted successfully from recipe."
}
```
------------------------------------------------
### Ng Kai Huat Jason
### 1. Retrieve User Pantry
- **Method:** GET
- **Request:** `http://localhost:3000/pantry/{user_id}`
- **Description:** Retrieve Pantry of a User and returns the Pantry ID
- **Example Successful Response:**
  ```json
  {
    "pantry_id": "0PVnY"
  }
  ```
- **Example No Pantry Response:**
  ```json
  {
    "message": "No pantry found for the user"
  }
  ```
### 2. Create User Pantry
- **Method:** POST
- **Request:** `http://localhost:3000/pantry/{user_id}`
- **Description:** Create Pantry for the User, it will check if the User has an existing Pantry if it does it will return that PantryID else it will create a new Pantry.
- **Example Successful Creation Response:**
  ```json
  {
    "message": "Pantry has been created for user",
    "pantry_id": "aXb55"
  }
  ```
- **Example Existing Pantry Response:**
  ```json
    {
    "message": "User already has a pantry",
    "pantry_id": "aXb55"
  }
  ```
### 3. Add Ingredient to Pantry
- **Method:** POST
- **Request:** `http://localhost:3000/pantry/{pantry_id}/ingredients`
- **Request Body**
  ```json
  {
    "ingredient_name":"Chicken",
    "quantity":"2"
  }
  ```
- **Description:** Adds a Ingredient to the Pantry via the Pantry ID, this will use the Spooncular API [searchIngredient](https://api.spoonacular.com/food/ingredients/search) to retrieve the Ingredient ID and Ingredient Name thats similar to the inputted ingredient name.
- **Example Successful Ingredient Added Response:**
  ```json
  {
    "message": "Ingredient added to pantry",
    "result": {
        "ingredient_id": 7961,
        "ingredient_name": "sliced chicken breast",
        "quantity": "2"
    }
  }
  ```
- **Example Unsuccessful Response:** this will occur if the ingredient name isn't valid
  ```json
  {
    "error": "Ingredient not found"
  }
  ```
### 4. Retrieve Pantry Ingredients
- **Method:** GET
- **Request:** `http://localhost:3000/pantry/{pantry_id}/ingredients`
- **Description:** Retrieve Ingredients of the respective Pantry as an array of ingredients
- **Example Successful Response:**
  ```json
  [
    {
        "ingredient_id": "7961",
        "ingredient_name": "sliced chicken breast",
        "quantity": 2
    }
  ]
  ```
- **Example No Pantry Ingredients Response:**
  ```json
  {
    "message": "No ingredients found in pantry"
  }
  ```
### 5. Modify Pantry Ingredients
- **Method:** PUT
- **Request:** `http://localhost:3000/pantry/{pantry_id}/ingredients`
- **Request Body**
  ```json
  {
      "ingredient_id":"7961",
      "quantity":"7"
  }
  ```
- **Description:** Modify the Quantity of the Ingredient that's in the Pantry, it will take in the ingredient_id and quantity
- **Example Successful Response:**
  ```json
  {
    "message": "Ingredient updated in pantry",
    "result": {
        "pantry_id": "aXb55",
        "ingredient_id": "7961",
        "quantity": "7"
    }
  }
  ```
- **Example No Pantry Ingredients with same ID Response:**
  ```json
  {
    "error": "Ingredient not found in pantry"
  }
  ```
### 7. Add Ingredient Quantity
- **Method:** PUT
- **Request:** `http://localhost:3000/pantry/{pantry_id}/addIngredientQuantity`
- **Request Body**
  ```json
  {
      "ingredient_id":"7961",
      "quantity":"2"
  }
  ```
- **Description:** Add quantity to a existing pantry ingredient
- **Example Successful Response:**
  ```json
  {
     "message": "Ingredient quantity updated in pantry",
     "result": {
         "pantry_id": "UEsi8",
         "ingredient_id": "15076",
         "quantity": 4
     }
  }
  ```
- **Example No Pantry Ingredients with same ID Response:**
  ```json
  {
    "error": "Ingredient not found in pantry"
  }
  ```
### 8. Deduct Ingredient Quantity
- **Method:** PUT
- **Request:** `http://localhost:3000/pantry/{pantry_id}/deductIngredientQuantity`
- **Request Body**
  ```json
  {
      "ingredient_id":"7961",
      "quantity":"2"
  }
  ```
- **Description:** Deducts Quantity of a existing pantry ingredient
- **Example Successful Response:**
  ```json
  {
  	"message": "Ingredient quantity updated in pantry",
    	"result": {
        	"pantry_id": "UEsi8",
        	"ingredient_id": "15076",
        	"quantity": 4
    	}
  }
  ```
- **Example No Pantry Ingredients with same ID Response:**
  ```json
  {
    "error": "Ingredient not found in pantry"
  }
  ```
### 9. Delete Pantry Ingredients
- **Method:** DELETE
- **Request:** `http://localhost:3000/pantry/{pantry_id}/ingredients`
- **Request Body**
  ```json
  {
      "ingredient_id":"7961",
  }
  ```
- **Description:** Delete the Ingredient that's in the pantry via the Ingredient ID
- **Example Successful Response:**
  ```json
  {
    "message": "Ingredient removed from pantry",
    "result": {
        "pantry_id": "aXb55",
        "ingredient_id": "7961"
    }
  }
  ```
- **Example No Pantry Ingredients with same ID Response:**
  ```json
  {
    "error": "Ingredient not found in pantry"
  }
  ```
------------------------------------------------
### An Yong Shyan 
### 1. User View Their Requests
- **Method:** GET
- **Request URL:** `http://localhost:5000/req/user/{user_id}`
- **Description:** Retrieve request information pertaining to a user, identified by ID.
---
**Example Successful Response Body for getRequestByUserId(1) when user_id = 1:**
- 200 OK
#### User inputs valid user_id ####
```json
[
    {
        "request_id": 1,
        "title": "Urgent food request",
        "category": "Urgent",
        "description": "Require immediate food, preferably meat",
        "user_id": 1,
        "volunteer_id": 2,
        "isCompleted": true,
        "admin_id": 3
    },
    {
        "request_id": 4,
        "title": "Requesting for water",
        "category": "Low Priority",
        "description": "Require water, need not be urgent",
        "user_id": 1,
        "volunteer_id": 2,
        "isCompleted": true,
        "admin_id": null
    }
]
```
---
**Example Error Response Body for getRequestByUserId(4) when user_id = 4:**
- 404 not found
#### User inputs invalid user_id ####
```
No requests found for this user
```
---
- 500 HTTP Internal Server Error
```
Error retrieving requests
```
---
### 2. User Create Request
- **Method:** POST
- **Request URL:** `http://localhost:5000/req`
- **Description:** Create new request, request_id is auto-increment.
---
**Example Successful Response Body for createRequest():**
- 201 Created
#### User creates a new request ####
```json
{
    "title": "Requesting for water",
    "category": "Low Priority",
    "description": "Require water, need not be urgent",
    "user_id": 1,
    "volunteer_id": 2,
    "isCompleted": true,
    "admin_id": null
}
```
---
**Example Error Response Body for createRequest():**
- 400 Bad Request
#### User does not input required fields ####
```json
{
    "message": "Validation error",
    "errors": [
        "\"title\" is required",
        "\"category\" is required",
        "\"description\" is required",
        "\"user_id\" is required",
        "\"isCompleted\" is required"
    ]
}
```
---
- 500 Internal Server Error
#### Server Error ####
```
Error creating request
```
---
### 3. Volunteers & Admins view available requests
- **Method:** GET
- **Request URL:** `http://localhost:5000/available`
- **Description:** View available requests - volunteer_id = null, admin_id = null, isCompleted = false.
---
**Example Successful Response Body for getAvailableRequests():**
- 200 OK
#### Volunteer & Admins view available requests ####
```json
[
    {
        "request_id": 3,
        "title": "Baked Goods",
        "category": "High Priority",
        "description": "I need some baked goods for meals",
        "user_id": 3,
        "volunteer_id": null,
        "isCompleted": false,
        "admin_id": null
    }
]
```
---
**Example Error Response Body for getAvailableRequests():**
- 404 Not Found
#### No Available Requests ####
```
No available requests found
```
---
- 500 Internal Server Error
#### Server Error ####
```
Error retrieving available requests
```
---
### 4. Volunteers accepts requests
- **Method:** PATCH
- **Request URL:** `http://localhost:5000/req/accepted/update/{request_id}`
- **Description:** Volunteer updates the volunteer_id in appropriate request_id with their own id.
---
**Example Successful Response Body for updateAcceptedRequest():**
- 200 OK
#### Volunteer inputs valid volunteer_id into request_id = 2  ####

Input:
```json
{
    "volunteer_id": 1
}
```
Output:
```json
{
    "request_id": 2,
    "title": "Liquids Please",
    "category": "Low Priority",
    "description": "Require liquids like water, plus protein powder",
    "user_id": 2,
    "volunteer_id": 1,
    "isCompleted": false,
    "admin_id": null
}
```
---
**Example Error Response Body for updateAcceptedRequest():**
- 404 Not Found
#### No Requests Found ####
```
Request not found
```
---
- 500 Internal Server Error
#### Server Error ####
```
Error updating accepted request
```
### 5. Volunteer view accepted requests
- **Method:** GET
- **Request URL:** `http://localhost:5000/req/accepted/{volunteer_id}`
- **Description:** Volunteer updates the volunteer_id in appropriate request_id with their own id.
---
**Example Successful Response Body for getAcceptedRequestById(2) when volunteer_id = 2:**
- 200 OK
#### Volunteer with volunteer id = 2 views accepted request ####
```json
[
    {
        "request_id": 1,
        "title": "Urgent food request",
        "category": "Urgent",
        "description": "Require immediate food, preferably meat",
        "user_id": 1,
        "volunteer_id": 2,
        "isCompleted": true,
        "admin_id": 3
    },
    {
        "request_id": 4,
        "title": "Requesting for water",
        "category": "Low Priority",
        "description": "Require water, need not be urgent",
        "user_id": 1,
        "volunteer_id": 2,
        "isCompleted": true,
        "admin_id": null
    }
]
```
---
**Example Error Response Body for getAcceptedRequestById():**
- 404 Not Found
#### No Requests Found ####
```
No accepted requests found for this volunteer
```
---
- 500 Internal Server Error
#### Server Error ####
```
Error retrieving accepted requests
```
### 6. User updates request to be completed
- **Method:** PATCH
- **Request URL:** `http://localhost:5000/req/completed/{request_id}`
- **Description:** User updates the appropriate request by request id to be isCompleted = true.
---
**Example Successful Response Body for updateCompletedRequest(1) when request_id = 1:**
- 200 OK
#### User updates valid request to be completed ####
```json
{
    "request_id": 1,
    "title": "Urgent food request",
    "category": "Urgent",
    "description": "Require immediate food, preferably meat",
    "user_id": 1,
    "volunteer_id": 2,
    "isCompleted": true,
    "admin_id": 3
}
```
---
**Example Error Response Body for updateCompletedRequest():**
- 404 Not Found
#### No Requests Found ####
```
Request not found
```
---
- 500 Internal Server Error
#### Server Error ####
```
Error updating request to completed
```
### 7. Allows details of specific requests to be viewed
- **Method:** GET
- **Request URL:** `http://localhost:5000/req/{request_id}`
- **Description:** User views request by request id.
---
**Example Successful Response Body for getRequestById(1) when request_id = 1:**
- 200 OK
#### Allows specific requests to be viewed ####
```json
{
    "request_id": 1,
    "title": "Urgent food request",
    "category": "Urgent",
    "description": "Require immediate food, preferably meat",
    "user_id": 1,
    "volunteer_id": 2,
    "isCompleted": true,
    "admin_id": 3
}
```
---
**Example Error Response Body for getRequestById():**
- 404 Not Found
#### No Requests Found ####
```
Request not found
```
---
- 500 Internal Server Error
#### Server Error ####
```
Error retrieving request
```
### 8. Volunteers view User Profile
- **Method:** GET
- **Request URL:** `http://localhost:5000/user/{user_id}`
- **Description:** Volunteers view specific user profile by user_id.
---
**Example Successful Response Body for getUserDetailsById(1) when user_id = 1:**
- 200 OK
#### Allows a specific user to be viewed ####
```json
{
    "user_id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "dob": "1985-01-15T00:00:00.000Z",
    "address": "123 Main St, Anytown, USA",
    "email": "john.doe@example.com",
    "contact": "555-1234",
    "password": "password123",
    "dietaryrestrictions": "Vegan",
    "intolerances": "Gluten",
    "excludedingredients": "Peanuts"
}
```
---
**Example Error Response Body for getRequestById():**
- 404 Not Found
#### No User Found ####
```
User not found
```
---
- 500 Internal Server Error
#### Server Error ####
```
Error retrieving user details
```
### 9. Admin approves requests
- **Method:** PATCH
- **Request URL:** `http://localhost:5000/req/approve/{admin_id}`
- **Description:** Admin approves requests.
---
**Example Successful Response Body for updateApproveRequest(1) when admin_id = 1:**
- 200 OK
#### Allows admin to approve request by updating the admin_id ####
Input:
```json
{
    "admin_id": 1
}
```
Output:
```json
{
    "request_id": 1,
    "title": "Urgent food request",
    "category": "Urgent",
    "description": "Require immediate food, preferably meat",
    "user_id": 1,
    "volunteer_id": 2,
    "isCompleted": true,
    "admin_id": 1
}
```
---
**Example Error Response Body for updateApproveRequest():**
- 404 Not Found
#### No User Found ####
```
Request not found
```
---
- 500 Internal Server Error
#### Server Error ####
```
Error approving request
```
### 10. View Accepted Requests
- **Method:** GET
- **Request URL:** `http://localhost:5000/accepted`
- **Description:** View accepted requests when volunteer id is not null.
---
**Example Successful Response Body for getAcceptedRequest():**
- 200 OK
#### Allows admin to view request that has volunteer id as not null ####
```json
[
    {
        "request_id": 1,
        "title": "Urgent food request",
        "category": "Urgent",
        "description": "Require immediate food, preferably meat",
        "user_id": 1,
        "volunteer_id": 2,
        "isCompleted": true,
        "admin_id": 1
    },
    {
        "request_id": 2,
        "title": "Liquids Please",
        "category": "Low Priority",
        "description": "Require liquids like water, plus protein powder",
        "user_id": 2,
        "volunteer_id": 1,
        "isCompleted": false,
        "admin_id": null
    },
    {
        "request_id": 4,
        "title": "Requesting for water",
        "category": "Low Priority",
        "description": "Require water, need not be urgent",
        "user_id": 1,
        "volunteer_id": 2,
        "isCompleted": true,
        "admin_id": null
    }
]
```
---
**Example Error Response Body for getAcceptedRequest():**
- 404 Not Found
#### No Request Found ####
```
No accepted requests found
```
---
- 500 Internal Server Error
#### Server Error ####
```
Error retrieving accepted requests
```
### 11. Delete request
- **Method:** DELETE
- **Request URL:** `http://localhost:5000/req/{request_id}`
- **Description:** Delete appropriate request.
---
**Example Successful Response Body for deleteRequest(1):**
- 200 OK
#### Allows admin to delete request according to the request id ####
```
Request deleted successfully
```
---
**Example Error Response Body for deleteRequest():**
- 404 Not Found
#### No Request Found ####
```
Request not found
```
---
- 500 Internal Server Error
#### Server Error ####
```
Error deleting request
```
------------------------------------------------
### Node Packages Utilised:
#### Dependencies
- axios: HTTP client for making requests.
- bcrypt: Library for hashing passwords.
- cookie-parser: Middleware for parsing cookies.
- cors: Middleware for enabling Cross-Origin Resource Sharing.
- date-fns: Utility library for date manipulation.
- dotenv: Loads environment variables from a .env file.
- express: Web framework for Node.js.
- joi: Schema validation library.
- jsonwebtoken: Library for working with JSON Web Tokens.
- mockingoose: Mocking library for Mongoose models.
- mssql: SQL Server client for Node.js.
- swagger-autogen: Automatic Swagger documentation generation.
- swagger-ui-express: Middleware for serving Swagger UI.
- uuid: Library for generating unique IDs.
#### DevDependencies
- @shelf/jest-mongodb: Jest integration for MongoDB. 
- jest: Testing framework.
- mongodb-memory-server: In-memory MongoDB server for testing.
- mongoose: ODM (Object Data Modeling) library for MongoDB.
- nodemon: Tool for automatically restarting the application.
- supertest: HTTP assertions library for testing Express applications.
------------------------------------------------
### External Sources Utilised:
- [Spooncular API](https://spoonacular.com/food-api)
- [MongoDB](https://www.mongodb.com/)
### References:
- [Node.js and Express.js Tutorial](https://www.youtube.com/watch?v=Oe421EPjeBE&t=27893s&ab_channel=freeCodeCamp.org)
- [Node.js/Express - Build 4 Projects](https://www.youtube.com/watch?v=qwfE7fSVaZM&t=34734s&ab_channel=freeCodeCamp.org)
- [Node.js Full Course for Beginners](https://www.youtube.com/watch?v=f2EqECiTBL8&t=7333s&ab_channel=DaveGray)
- [What is Middleware in Express JS? | Node.js Tutorials for Beginners](https://www.youtube.com/watch?v=y18ubz7gOsQ&list=PL0Zuz27SZ-6P4vnjQ_PJ5iRYsqJkQhtUu&index=2&ab_channel=DaveGray)
- [How to Setup Routes with Express Router | Node.js & Express tutorials for Beginners](https://www.youtube.com/watch?v=Zh7psmf1KAA&list=PL0Zuz27SZ-6P4vnjQ_PJ5iRYsqJkQhtUu&index=3&ab_channel=DaveGray)
- [MVC Model-View-Controller Example | CRUD REST API | Node.js & Express tutorials for Beginners](https://www.youtube.com/watch?v=Dco1gzVZKVk&list=PL0Zuz27SZ-6P4vnjQ_PJ5iRYsqJkQhtUu&index=4&ab_channel=DaveGray)
- [User Password Authentication | Node.js & Express Tutorials for Beginners](https://www.youtube.com/watch?v=Nlg0JrUt0qg&list=PL0Zuz27SZ-6P4vnjQ_PJ5iRYsqJkQhtUu&index=5&ab_channel=DaveGray)
- [JWT Authentication | Node JS and Express tutorials for Beginners](https://www.youtube.com/watch?v=favjC6EKFgw&list=PL0Zuz27SZ-6P4vnjQ_PJ5iRYsqJkQhtUu&index=6&ab_channel=DaveGray)
- [How to Authorize User Roles and Permissions | Node.js & Express Authorization Tutorial](https://www.youtube.com/watch?v=fUWkVxCv4IQ&list=PL0Zuz27SZ-6P4vnjQ_PJ5iRYsqJkQhtUu&index=7&ab_channel=DaveGray)
- [Refresh Token Rotation and Reuse Detection in Node.js JWT Authentication](https://www.youtube.com/watch?v=s-4k5TcGKHg&list=PL0Zuz27SZ-6PFkIxaJ6Xx_X46avTM1aYw&index=17&ab_channel=DaveGray)
