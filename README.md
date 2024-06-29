# BED2024Apr_P03_T05
BED 2024 Assignment

# NutriAid

## Team Members
- **Yeo Jin Rong** - S10258457
- **An Yong Shyan** - S10258126
- **Ng Kai Huat Jason** - S10262552

## Introduction
We are Team 5 from P03, taking the BED Module from Software Engineering Specialisation under Information Technology (N54). This repository is for our assignment project, NutriAid.

NutriAid is a web application designed to bridge the gap between underprivileged individuals and volunteers willing to provide food aid.

## Objective
The platform facilitates efficient and organised distribution of food resources by allowing users to post their requests for help in a forum-like manner, which volunteers are able to accept and fulfil. This will be achieved through three main goals:
1. Provide a way to allow underprivileged individuals to post requests asking for food.
2. Facilitate volunteers in finding and fulfilling these requests.
3. Ensure efficient and organized distribution of food resources.

## CRUD Operations
Below we have listed the CRUD Operations performed by each member:

### Yeo Jin Rong
#### 1. Retrieve User Information
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
### Ng Kai Huat Jason 
```
1) GET http://localhost:3000/pantry/{user_id}
-----------------------------------
This is GET (Retrieve) request to obtain the Pantry ID of the User

  Example Input - GET http://localhost:3000/pantry/UID1

  Example of response from this query is
  {
    "pantry_id": "0PVnY"
  }
```

```
2) POST http://localhost:3000/pantry/{user_id}
-----------------------------------
This is POST (Create) request to create Pantry for the User, it will check if the User has an existing Pantry if it does it will return that PantryID else it will create a new Pantry.

  ##Example of Request - POST http://localhost:3000/pantry/UID1

  Example of response of a successful creation
  {
    "message": "Pantry has been created for user",
    "pantry_id": "aXb55"
  }

  Example of response of a existing pantry
  {
    "message": "User already has a pantry",
    "pantry_id": "aXb55"
  }
```
------------------------------------------------
### An Yong Shyan 
```
1) GET https://localhost:5000/users/{id}
-----------------------------------
This is GET (Retrieve) request to obtain information pertaining to a user, identified by id, etc.

  Example of response from this query is
  XXXX
```

```
2) POST https://localhost:5000/users/{id}
-----------------------------------
This is POST (Create) request to create User.

  Example of response from this query is
  XXXX
```
------------------------------------------------
### Node Packages Utilised:
- Express
- Axios
- MSsql
- Body-Parser
