// tests/mockData.js
const users = [
    {
      _id: '60c72b2f9b1d8b3a3c8d1e33',
      username: 'user1',
      email: 'user1@example.com',
      dateCreated: '2024-07-19T19:31:15.197Z',
      dietaryRestrictions: [],
      excludedIngredients: [],
      intolerances: [],
      roles: { User: 2001 },
    },
    {
      _id: '60c72b3f9b1d8b3a3c8d1e34',
      username: 'user2',
      email: 'user2@example.com',
      dateCreated: '2024-07-19T19:31:15.198Z',
      dietaryRestrictions: [],
      excludedIngredients: [],
      intolerances: [],
      roles: { User: 2001 },
    },
  ];
  
  const newUser = {
    username: 'TestUserWithSQL',
    password: 'User123!',
    email: 'john.doe.xxx@example.com',
    contact: '12345678',
    roles: { User: 2001 },
    firstname: 'Test',
    lastname: 'User',
    address: '123 Main St',
    dietaryRestrictions: ['Pescetarian', 'Paleo'],
    intolerances: ['Sesame', 'Shellfish'],
    excludedIngredients: ['fish', 'chicken', 'beef'],
    dateOfBirth: '2024-06-06',
  };
  
  module.exports = {
    users,
    newUser,
  };
  