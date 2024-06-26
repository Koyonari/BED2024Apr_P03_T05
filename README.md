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
- **Description:** Creates an account, either as a Volunteer or User, seperate specific request for new users

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
        "password": "$2b$10$Dm/sdhOAslQF5tKRJzxeie5fO2cmoNZNsWxSsu9Dgl0LU8vx83lXS",
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
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTk2NTk2ODUsImV4cCI6MTcxOTc0NjA4NX0.zSig95MuxJmzfS-deqjQP-t0aKTovt5eZNJNNFBkOqg"
    }
```
- This is one object, however after there can be more User objects nested within this array

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
    "password": "$2b$10$jlSbIApG/j9HDWYSa15S0./V7JoTqKSX0ZxSMp9jD3h/4oB6xBNWG",
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
    "__v": 0,
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI2NjdmZWM1OTRmYWM2MjA5NzI1ODA2MzYiLCJpYXQiOjE3MTk2NzMyNzgsImV4cCI6MTcxOTc1OTY3OH0.Vm7JbZ_-wRha3wl-9eqzEB-tTR2ltv6VAYV6oLrkAE0"
}
```
- Status 200 OK

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

- **Method:** PATCH
- **Request URL:** `http://localhost:3500/users/{id}`
- **Description:** Update information based on user_id as paramaters, authenthicated as either user themselves or admin.
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
### 9. Delete User by ID

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

### 10. Get Recipes based on Pantry

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

1) GET PantryIngredients
- **Method:** GET
- **Request URL:** `N/A Nested Request`
- **Description:** Function to get all available ingredients in a user's pantry, based on user ID
- **Authorisation:** JWT Cookie

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
### 6. Delete Pantry Ingredients
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
### 1. Template
- **Method:** GET
- **Request:** `https://localhost:5000/users/{id}`
- **Description:** Retrieve information pertaining to a user, identified by ID.
- **Example Response:**
  ```json
  {
    "id": "12345",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user"
  }
  ```
------------------------------------------------
### Node Packages Utilised:
- express: A web framework for building web applications and APIs.
- axios: A promise-based HTTP client for making HTTP requests.
- mssql: A Microsoft SQL Server client for Node.js.
- body-parser: Middleware for parsing incoming request bodies.
- dotenv: Loads environment variables from a .env file.
- express: A web framework for building web applications and APIs.
- path: A core Node.js module for handling file and directory paths.
- cors: Middleware for enabling Cross-Origin Resource Sharing (CORS).
- cookie-parser: Middleware for parsing cookies.
- mongoose: An ODM (Object Data Modeling) library for MongoDB and Node.js.
- jsonwebtoken: For creating and verifying JSON Web Tokens (JWT).
- Joi: For data validation.
- date-fns: For manipulating and formatting dates.
- uuid: For generating unique identifiers.
- bcrypt: For hashing passwords.
------------------------------------------------
### External Sources Utilised:
- [Spooncular API](https://spoonacular.com/food-api)
- [MongoDB](https://www.mongodb.com/)


