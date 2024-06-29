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
#### 1. Account Registration

- **Method:** POST
- **Request URL:** `http://localhost:3500/register`
- **Description:** Registration of an account, either as a Volunteer or User

### Example Request Body for Volunteer:

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
### Example Request Body for User:
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
###Example Successful Response Body:
```json
{
    "success": "New user TestUser1 created!"
}
```
- Status 200
- 
### Example Errorneous Response:
- User has input a non-unique email
``` json
{
    "message": "E11000 duplicate key error collection: CompanyDB.users index: email_1 dup key: { email: \"john.doe@example.com\" }"
}
```
- Status 500
- 
## User has not fufilled all required inputs
``` json
{
    "message": "Username, password, email, and contact are required."
}
```
- Status 400
- 
## User has input a username that is already pre-existing
``` json
{
    "message": "Username already exists."
}
```
- Status 409
  
#### 2. Authenthication (Login)

- **Method:** POST
- **Request URL:** `http://localhost:3500/auth`
- **Description:** Authenthication of account by username and password (login functionaility), provides a JWT (jsonwebtoken) as well as adding refreshToken into MongoDB

### Example Request Body for Login:
```json
{
	"username": "TestUser",
	"password": "User123!"
}
```

### Example Succesful Request Response for Login:
```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJ1c2VyaWQiOiI2NjdmZWM1OTRmYWM2MjA5NzI1ODA2MzYiLCJ1c2VybmFtZSI6IlRlc3RVc2VyIiwicm9sZXMiOlsyMDAxXX0sImlhdCI6MTcxOTY3MDAwOCwiZXhwIjoxNzE5NjczNjA4fQ.aFcJX7ZhnJ_YytFMSdW12HqK8W5U-_K5kVQNwSJAslA"
}
```
- JsonWebToken will also be added as a cookie
- Status 200
### Example Errorneous Response:

## User has not input password
```json
{
    "message": "Username and password are required."
}
```
- Status 400
## User input wrong password or wrong username
```json
{
    "message": "Invalid username or password."
}
```
- Status 401 Unauthorised

#### 3. Refresh JWT Token

- **Method:** GET
- **Request URL:** `http://localhost:3500/refresh`
- **Description:** Refreshes JSON Web Token for User, updates database with new refreshToken

### Example Request Body for Refresh Token:
```json
N/A request is the JWT cookie itself
```

### Example Successful Response Body for Refresh Token:
```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJ1c2VyaWQiOiI2NjdmZWM1OTRmYWM2MjA5NzI1ODA2MzYiLCJyb2xlcyI6WzIwMDFdfSwiaWF0IjoxNzE5NjcwODgwLCJleHAiOjE3MTk2NzQ0ODB9.hgWn5G23hMolK1GHDIQ31921NNvwbLQtjn2wCEWJVfM"
}
```
- Status 200

### Example Errorneous Response Body for Refresh Token:

## User has no jwt cookie
```json
{
    "message": "Unauthorized: No refreshToken cookie found"
}
```
- Status 401 Unauthorized

#### 4. Logout

- **Method:** GET
- **Request URL:** `http://localhost:3500/logout`
- **Description:** Removes refreshtoken parameter in MongoDB database

```json
No request body
No response body
```

------------------------------------------------
### Ng Kai Huat Jason
#### 1. Retrieve User Pantry
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
#### 2. Create User Pantry
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
#### 3. Add Ingredient to Pantry
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
#### 4. Retrieve Pantry Ingredients
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
#### 5. Modify Pantry Ingredients
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
#### 6. Delete Pantry Ingredients
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
#### 1. Template
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
- Express
- Axios
- MSsql
- Body-Parser
------------------------------------------------
### External Sources Utilised:
- [Spooncular API](https://spoonacular.com/food-api)
- [MongoDB](https://www.mongodb.com/)


