# BED2024Apr_P03_T05
BED 2024 Assignment

## Team Members:
- S10258457 - **Yeo Jin Rong**
- S10258126 - **An Yong Shyan**  
- S10262552 - **Ng Kai Huat Jason** 
  
##  Intro to NutriAid
### Introduction
We are Team 5 from P03 taking the BED Module from Software Engineering Specialisation under Information Technology (N54).   

This repository is for our assignment.  
  
Our application is a volunteering platform called NutriAid.    
> NutriAid is a web application designed to bridge the gap between underprivileged individuals and volunteers willing to provide food aid. 


### Objective
The platform facilitates efficient and organised distribution of food resources by allowing users to post their requests for help in a forum-like manner, which volunteers are able to accept and fulfil those requests.

This will be achieved through 3 main goals:
1) Provide a way to allow underprivileged individuals to post requests asking for food

## CRUD Operations
### Below we have listed the CRUD Operations done by each member

### Yeo Jin Rong 
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
This is POST (Create) request to create Pantry for the user, it will check if the 

  Example of response from this query is
  XXXX
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
