// Define the function
const validateUpdateFields = (updates) => {
    console.log('Validating updates:', updates);
    
    if (typeof updates !== 'object' || Array.isArray(updates) || updates === null) {
      throw new Error('Updates must be an object');
    }
  
    if (typeof updates.title !== 'string' || updates.title.trim() === '') {
      throw new Error('Title must be a non-empty string');
    }
  
    if (typeof updates.imageurl !== 'string') {
      throw new Error('Image URL must be a string');
    }
  
    if (!Number.isInteger(updates.servings)) {
      throw new Error('Servings must be an integer');
    }
  
    if (!Number.isInteger(updates.readyInMinutes)) {
      throw new Error('Ready in minutes must be an integer');
    }
  
    if (typeof updates.pricePerServing !== 'number') {
      throw new Error('Price per serving must be a number');
    }
  };
  
  // Test the function
  const testUpdate = {
    title: 'Cod with Tomato-Olive-Chorizo Sauce and Mashed Potatoes',
    imageurl: 'https://img.spoonacular.com/recipes/639851-556x370.jpg',
    servings: 2,
    readyInMinutes: 45,
    pricePerServing: 626.14
  };
  
  try {
    validateUpdateFields(testUpdate);
    console.log('Validation passed!');
  } catch (error) {
    console.error('Validation failed:', error.message);
  }
  