const {
  getRecipes,
  getAllRecipesByUser,
  getFilteredRecipesByUser,
  getAllRecipes,
  getRecipeIngredients,
  insertRecipeByUser,
  insertRecipeIngredientsByRecipeId,
  updateRecipeByUser,
  updateRecipeByRecipeId,
  patchRecipeByUser,
  patchRecipeByRecipeId,
  deleteRecipeByUser,
  deleteRecipeByRecipeId,
  deleteRecipeIngredientByRecipeId,
} = require('../controllers/recipeController');

const pantry = require('../models/pantry');
const recipeService = require('../services/recipeService');
const {
  getRecipeById,
  getRecipesByUserId,
  getAllStoredRecipes,
  getRecipeIngredientsById,
  insertRecipe,
  insertRecipeIngredient,
  updateRecipeDetailsbyUser,
  editRecipe,
  deleteRecipe,
  deleteRecipeIngredients,
} = require('../models/recipe');

jest.mock('../models/pantry');
jest.mock('../services/recipeService');
jest.mock('../models/recipe');

describe('Recipe Controller Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test cases for getRecipes function
  describe('getRecipes', () => {
    it('should fetch recipes and store them in the database', async () => {
      // Mock data and setup for the test
      const mockUserId = 'user123';
      const mockIngredients = [{ name: 'ingredient1' }, { name: 'ingredient2' }];
      const mockRecipes = [{ id: 'recipe1', title: 'Recipe 1' }, { id: 'recipe2', title: 'Recipe 2' }];

      pantry.getIngredients.mockResolvedValue(mockIngredients);
      recipeService.fetchRecipes.mockResolvedValue(mockRecipes);
      insertRecipe.mockResolvedValue(); // Mock insertRecipe function

      const req = { userid: mockUserId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Call the controller function
      await getRecipes(req, res);

      // Assertions
      expect(pantry.getIngredients).toHaveBeenCalledWith(mockUserId);
      expect(recipeService.fetchRecipes).toHaveBeenCalledWith(mockIngredients);
      expect(insertRecipe).toHaveBeenCalledTimes(mockRecipes.length);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockRecipes);
    });

    it('should handle errors during recipe fetching and storing', async () => {
      // Mock data and setup for the test
      pantry.getIngredients.mockRejectedValue(new Error('Mock error'));

      const req = { userid: 'user123' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Call the controller function
      await getRecipes(req, res);

      // Assertions
      expect(pantry.getIngredients).toHaveBeenCalledWith(req.userid);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching and storing recipes', error: 'Mock error' });
    });
  });

  // Test cases for getAllRecipesByUser function
  describe('getAllRecipesByUser', () => {
    it('should fetch all recipes for a user', async () => {
      // Mock data and setup for the test
      const mockUserId = 'user123';
      const mockRecipes = [{ id: 'recipe1', title: 'Recipe 1' }, { id: 'recipe2', title: 'Recipe 2' }];

      getRecipesByUserId.mockResolvedValue(mockRecipes);

      const req = { userid: mockUserId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Call the controller function
      await getAllRecipesByUser(req, res);

      // Assertions
      expect(getRecipesByUserId).toHaveBeenCalledWith(mockUserId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecipes);
    });

    it('should handle error when fetching recipes by user ID', async () => {
      // Mock data and setup for the test
      getRecipesByUserId.mockRejectedValue(new Error('Mock error'));

      const req = { userid: 'user123' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Call the controller function
      await getAllRecipesByUser(req, res);

      // Assertions
      expect(getRecipesByUserId).toHaveBeenCalledWith(req.userid);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error getting recipes by user ID', error: 'Mock error' });
    });

    it('should handle case where no recipes are found for a user', async () => {
      // Mock data and setup for the test
      getRecipesByUserId.mockResolvedValue([]);

      const req = { userid: 'user123' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Call the controller function
      await getAllRecipesByUser(req, res);

      // Assertions
      expect(getRecipesByUserId).toHaveBeenCalledWith(req.userid);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No recipes found for the user' });
    });

    it('should handle case where user ID is not provided', async () => {
      const req = {}; // Simulating missing userid
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Call the controller function
      await getAllRecipesByUser(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID not provided' });
    });
  });

  describe('getFilteredRecipesByUser', () => {
    it('should fetch filtered recipes for a user based on criteria', async () => {
      const mockUserId = 'user123';
      const mockCriteria = { category: 'Breakfast' };
      const mockFilteredRecipes = [
        { id: 'recipe1', title: 'Breakfast Recipe 1' },
        { id: 'recipe2', title: 'Breakfast Recipe 2' },
      ];
  
      getRecipesByUserId.mockResolvedValue(mockFilteredRecipes);
  
      const req = { userid: mockUserId, query: mockCriteria };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await getFilteredRecipesByUser(req, res);
  
      expect(getRecipesByUserId).toHaveBeenCalledWith(mockUserId, mockCriteria);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockFilteredRecipes);
    });
  
    it('should handle error when fetching filtered recipes by user ID and criteria', async () => {
      const mockUserId = 'user123';
      const mockCriteria = { category: 'Dinner' };
  
      getRecipesByUserId.mockRejectedValue(new Error('Mock error'));
  
      const req = { userid: mockUserId, query: mockCriteria };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await getFilteredRecipesByUser(req, res);
  
      expect(getRecipesByUserId).toHaveBeenCalledWith(mockUserId, mockCriteria);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching filtered recipes', error: 'Mock error' });
    });
  
    it('should handle case where no filtered recipes are found for a user', async () => {
      const mockUserId = 'user123';
      const mockCriteria = { category: 'Lunch' };
  
      getRecipesByUserId.mockResolvedValue([]);
  
      const req = { userid: mockUserId, query: mockCriteria };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await getFilteredRecipesByUser(req, res);
  
      expect(getRecipesByUserId).toHaveBeenCalledWith(mockUserId, mockCriteria);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No filtered recipes found for the user' });
    });
  
    it('should handle case where user ID or criteria is not provided', async () => {
      const req = { userid: '', query: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await getFilteredRecipesByUser(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID not provided' });
    });
  });

  // Test cases for getAllRecipes function
  describe('getAllRecipes', () => {
    it('should fetch all recipes stored in the database', async () => {
      // Mock data and setup for the test
      const mockRecipes = [{ id: 'recipe1', title: 'Recipe 1' }, { id: 'recipe2', title: 'Recipe 2' }];
  
      getAllStoredRecipes.mockResolvedValue(mockRecipes);
  
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await getAllRecipes(req, res);
  
      // Assertions
      expect(getAllStoredRecipes).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecipes);
    });
  
    it('should handle error when fetching all recipes', async () => {
      // Mock data and setup for the test
      getAllStoredRecipes.mockRejectedValue(new Error('Mock error'));
  
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await getAllRecipes(req, res);
  
      // Assertions
      expect(getAllStoredRecipes).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error getting all recipes', error: 'Mock error' });
    });
  });

  // Test cases for getRecipeIngredients function
  describe('getRecipeIngredients', () => {
    it('should fetch ingredients for a recipe', async () => {
      // Mock data and setup for the test
      const mockRecipeId = 'recipe123';
      const mockIngredients = [{ id: 'ingredient1', name: 'Ingredient 1' }, { id: 'ingredient2', name: 'Ingredient 2' }];
  
      getRecipeIngredientsById.mockResolvedValue(mockIngredients);
  
      const req = { recipeId: mockRecipeId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await getRecipeIngredients(req, res);
  
      // Assertions
      expect(getRecipeIngredientsById).toHaveBeenCalledWith(mockRecipeId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockIngredients);
    });
  
    it('should handle error when fetching ingredients for a recipe', async () => {
      // Mock data and setup for the test
      const mockRecipeId = 'recipe123';
  
      getRecipeIngredientsById.mockRejectedValue(new Error('Mock error'));
  
      const req = { recipeId: mockRecipeId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await getRecipeIngredients(req, res);
  
      // Assertions
      expect(getRecipeIngredientsById).toHaveBeenCalledWith(mockRecipeId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error getting recipe ingredients', error: 'Mock error' });
    });
  
    it('should handle case where no ingredients are found for a recipe', async () => {
      // Mock data and setup for the test
      const mockRecipeId = 'recipe123';
  
      getRecipeIngredientsById.mockResolvedValue([]);
  
      const req = { recipeId: mockRecipeId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await getRecipeIngredients(req, res);
  
      // Assertions
      expect(getRecipeIngredientsById).toHaveBeenCalledWith(mockRecipeId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No ingredients found for the recipe' });
    });
  
    it('should handle case where recipe ID is not provided', async () => {
      const req = {}; // Simulating missing recipeId
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await getRecipeIngredients(req, res);
  
      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recipe ID not provided' });
    });
  });

  // Test cases for insertRecipeByUser function
  describe('insertRecipeByUser', () => {
    it('should insert a new recipe for a user', async () => {
      // Mock data and setup for the test
      const mockUserId = 'user123';
      const mockRecipeData = { title: 'New Recipe', ingredients: ['ingredient1', 'ingredient2'], instructions: 'Cook it!' };
  
      insertRecipe.mockResolvedValue(); // Mock insertRecipe function
  
      const req = { userid: mockUserId, body: mockRecipeData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await insertRecipeByUser(req, res);
  
      // Assertions
      expect(insertRecipe).toHaveBeenCalledWith(mockUserId, mockRecipeData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recipe inserted successfully' });
    });
  
    it('should handle error when inserting a new recipe for a user', async () => {
      // Mock data and setup for the test
      const mockUserId = 'user123';
      const mockRecipeData = { title: 'New Recipe', ingredients: ['ingredient1', 'ingredient2'], instructions: 'Cook it!' };
  
      insertRecipe.mockRejectedValue(new Error('Mock error'));
  
      const req = { userid: mockUserId, body: mockRecipeData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await insertRecipeByUser(req, res);
  
      // Assertions
      expect(insertRecipe).toHaveBeenCalledWith(mockUserId, mockRecipeData);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error inserting recipe', error: 'Mock error' });
    });
  
    it('should handle case where recipe data is incomplete or missing', async () => {
      const req = { userid: 'user123', body: {} }; // Simulating missing recipe data
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await insertRecipeByUser(req, res);
  
      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recipe data incomplete or missing' });
    });
  });
  
  // Test cases for insertRecipeIngredientsByRecipeId function
  describe('insertRecipeIngredientsByRecipeId', () => {
    it('should insert ingredients for a recipe by recipe ID', async () => {
      // Mock data and setup for the test
      const mockRecipeId = 'recipe123';
      const mockIngredients = ['ingredient1', 'ingredient2'];
  
      insertRecipeIngredient.mockResolvedValue(); // Mock insertRecipeIngredient function
  
      const req = { recipeId: mockRecipeId, body: mockIngredients };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await insertRecipeIngredientsByRecipeId(req, res);
  
      // Assertions
      expect(insertRecipeIngredient).toHaveBeenCalledWith(mockRecipeId, mockIngredients);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recipe ingredients inserted successfully' });
    });
  
    it('should handle error when inserting ingredients for a recipe by recipe ID', async () => {
      // Mock data and setup for the test
      const mockRecipeId = 'recipe123';
      const mockIngredients = ['ingredient1', 'ingredient2'];
  
      insertRecipeIngredient.mockRejectedValue(new Error('Mock error'));
  
      const req = { recipeId: mockRecipeId, body: mockIngredients };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await insertRecipeIngredientsByRecipeId(req, res);
  
      // Assertions
      expect(insertRecipeIngredient).toHaveBeenCalledWith(mockRecipeId, mockIngredients);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error inserting recipe ingredients', error: 'Mock error' });
    });
  
    it('should handle case where recipe ID or ingredients data is incomplete or missing', async () => {
      const req = { recipeId: 'recipe123', body: {} }; // Simulating missing ingredients data
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await insertRecipeIngredientsByRecipeId(req, res);
  
      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recipe ID or ingredients data incomplete or missing' });
    });
  });

  // Test case for updateRecipeByUser (put) function
  describe('updateRecipeByUser', () => {
    it('should update details of a recipe by user', async () => {
      // Mock data and setup for the test
      const mockUserId = 'user123';
      const mockRecipeId = 'recipe123';
      const mockUpdatedRecipeData = { title: 'Updated Recipe', servings: 4 };
  
      editRecipe.mockResolvedValue(); // Mock editRecipe function
  
      const req = { userid: mockUserId, recipeId: mockRecipeId, body: mockUpdatedRecipeData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await updateRecipeByUser(req, res);
  
      // Assertions
      expect(editRecipe).toHaveBeenCalledWith(mockRecipeId, mockUpdatedRecipeData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recipe updated successfully' });
    });
  
    it('should handle error when updating details of a recipe by user', async () => {
      // Mock data and setup for the test
      const mockUserId = 'user123';
      const mockRecipeId = 'recipe123';
      const mockUpdatedRecipeData = { title: 'Updated Recipe', servings: 4 };
  
      editRecipe.mockRejectedValue(new Error('Mock error'));
  
      const req = { userid: mockUserId, recipeId: mockRecipeId, body: mockUpdatedRecipeData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await updateRecipeByUser(req, res);
  
      // Assertions
      expect(editRecipe).toHaveBeenCalledWith(mockRecipeId, mockUpdatedRecipeData);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating recipe', error: 'Mock error' });
    });
  
    it('should handle case where user ID, recipe ID, or updated data is incomplete or missing', async () => {
      const req = { userid: 'user123', recipeId: 'recipe123', body: {} }; // Simulating missing updated data
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await updateRecipeByUser(req, res);
  
      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID, recipe ID, or updated data incomplete or missing' });
    });
  });

  // Test case for updateRecipeByRecipeId (PUT) function
  describe('updateRecipeByRecipeId', () => {
    it('should update details of a recipe by recipe ID', async () => {
      // Mock data and setup for the test
      const mockRecipeId = 'recipe123';
      const mockUpdatedRecipeData = { title: 'Updated Recipe', servings: 4 };
  
      updateRecipeDetailsbyUser.mockResolvedValue(); // Mock updateRecipeDetailsbyUser function
  
      const req = { recipeId: mockRecipeId, body: mockUpdatedRecipeData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await updateRecipeByRecipeId(req, res);
  
      // Assertions
      expect(updateRecipeDetailsbyUser).toHaveBeenCalledWith(mockRecipeId, mockUpdatedRecipeData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recipe updated successfully' });
    });
  
    it('should handle error when updating details of a recipe by recipe ID', async () => {
      // Mock data and setup for the test
      const mockRecipeId = 'recipe123';
      const mockUpdatedRecipeData = { title: 'Updated Recipe', servings: 4 };
  
      updateRecipeDetailsbyUser.mockRejectedValue(new Error('Mock error'));
  
      const req = { recipeId: mockRecipeId, body: mockUpdatedRecipeData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await updateRecipeByRecipeId(req, res);
  
      // Assertions
      expect(updateRecipeDetailsbyUser).toHaveBeenCalledWith(mockRecipeId, mockUpdatedRecipeData);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating recipe', error: 'Mock error' });
    });
  
    it('should handle case where recipe ID or updated data is incomplete or missing', async () => {
      const req = { recipeId: 'recipe123', body: {} }; // Simulating missing updated data
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await updateRecipeByRecipeId(req, res);
  
      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recipe ID or updated data incomplete or missing' });
    });
  });

  // Test case for patchRecipeByUser (PATCH) function
  describe('patchRecipeByUser', () => {
    it('should patch details of a recipe by user', async () => {
      // Mock data and setup for the test
      const mockUserId = 'user123';
      const mockRecipeId = 'recipe123';
      const mockPatchData = { title: 'Patched Recipe' };
  
      editRecipe.mockResolvedValue(); // Mock editRecipe function
  
      const req = { userid: mockUserId, recipeId: mockRecipeId, body: mockPatchData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await patchRecipeByUser(req, res);
  
      // Assertions
      expect(editRecipe).toHaveBeenCalledWith(mockRecipeId, mockPatchData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recipe patched successfully' });
    });
  
    it('should handle error when patching details of a recipe by user', async () => {
      // Mock data and setup for the test
      const mockUserId = 'user123';
      const mockRecipeId = 'recipe123';
      const mockPatchData = { title: 'Patched Recipe' };
  
      editRecipe.mockRejectedValue(new Error('Mock error'));
  
      const req = { userid: mockUserId, recipeId: mockRecipeId, body: mockPatchData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await patchRecipeByUser(req, res);
  
      // Assertions
      expect(editRecipe).toHaveBeenCalledWith(mockRecipeId, mockPatchData);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error patching recipe', error: 'Mock error' });
    });
  
    it('should handle case where user ID, recipe ID, or patch data is incomplete or missing', async () => {
      const req = { userid: 'user123', recipeId: 'recipe123', body: {} }; // Simulating missing patch data
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the controller function
      await patchRecipeByUser(req, res);
  
      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID, recipe ID, or patch data incomplete or missing' });
    });
  });
  
  // 
  describe('updateRecipeByRecipeId', () => {
  it('should update details of a recipe by recipe ID', async () => {
    // Mock data and setup for the test
    const mockRecipeId = 'recipe123';
    const mockUpdatedRecipeData = { title: 'Updated Recipe', servings: 4 };

    updateRecipeDetailsbyUser.mockResolvedValue(); // Mock updateRecipeDetailsbyUser function

    const req = { recipeId: mockRecipeId, body: mockUpdatedRecipeData };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await updateRecipeByRecipeId(req, res);

    // Assertions
    expect(updateRecipeDetailsbyUser).toHaveBeenCalledWith(mockRecipeId, mockUpdatedRecipeData);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Recipe updated successfully' });
  });

  it('should handle error when updating details of a recipe by recipe ID', async () => {
    // Mock data and setup for the test
    const mockRecipeId = 'recipe123';
    const mockUpdatedRecipeData = { title: 'Updated Recipe', servings: 4 };

    updateRecipeDetailsbyUser.mockRejectedValue(new Error('Mock error'));

    const req = { recipeId: mockRecipeId, body: mockUpdatedRecipeData };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await updateRecipeByRecipeId(req, res);

    // Assertions
    expect(updateRecipeDetailsbyUser).toHaveBeenCalledWith(mockRecipeId, mockUpdatedRecipeData);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error updating recipe', error: 'Mock error' });
  });

  it('should handle case where recipe ID or updated data is incomplete or missing', async () => {
    const req = { recipeId: 'recipe123', body: {} }; // Simulating missing updated data
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await updateRecipeByRecipeId(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Recipe ID or updated data incomplete or missing' });
  });
});

// Test case for patchRecipeByRecipeId (PATCH) function
describe('patchRecipeByRecipeId', () => {
  it('should patch details of a recipe by recipe ID', async () => {
    // Mock data and setup for the test
    const mockRecipeId = 'recipe123';
    const mockPatchData = { title: 'Patched Recipe' };

    updateRecipeDetailsbyUser.mockResolvedValue(); // Mock updateRecipeDetailsbyUser function

    const req = { recipeId: mockRecipeId, body: mockPatchData };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await patchRecipeByRecipeId(req, res);

    // Assertions
    expect(updateRecipeDetailsbyUser).toHaveBeenCalledWith(mockRecipeId, mockPatchData);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Recipe patched successfully' });
  });

  it('should handle error when patching details of a recipe by recipe ID', async () => {
    // Mock data and setup for the test
    const mockRecipeId = 'recipe123';
    const mockPatchData = { title: 'Patched Recipe' };

    updateRecipeDetailsbyUser.mockRejectedValue(new Error('Mock error'));

    const req = { recipeId: mockRecipeId, body: mockPatchData };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await patchRecipeByRecipeId(req, res);

    // Assertions
    expect(updateRecipeDetailsbyUser).toHaveBeenCalledWith(mockRecipeId, mockPatchData);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error patching recipe', error: 'Mock error' });
  });

  it('should handle case where recipe ID or patch data is incomplete or missing', async () => {
    const req = { recipeId: 'recipe123', body: {} }; // Simulating missing patch data
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await patchRecipeByRecipeId(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Recipe ID or patch data incomplete or missing' });
  });
});

// Test case for deleteRecipeByUser (DELETE) function
describe('deleteRecipeByUser', () => {
  it('should delete a recipe by user', async () => {
    // Mock data and setup for the test
    const mockUserId = 'user123';
    const mockRecipeId = 'recipe123';

    deleteRecipe.mockResolvedValue(); // Mock deleteRecipe function

    const req = { userid: mockUserId, recipeId: mockRecipeId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await deleteRecipeByUser(req, res);

    // Assertions
    expect(deleteRecipe).toHaveBeenCalledWith(mockRecipeId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Recipe deleted successfully' });
  });

  it('should handle error when deleting a recipe by user', async () => {
    // Mock data and setup for the test
    const mockUserId = 'user123';
    const mockRecipeId = 'recipe123';

    deleteRecipe.mockRejectedValue(new Error('Mock error'));

    const req = { userid: mockUserId, recipeId: mockRecipeId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await deleteRecipeByUser(req, res);

    // Assertions
    expect(deleteRecipe).toHaveBeenCalledWith(mockRecipeId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting recipe', error: 'Mock error' });
  });

  it('should handle case where user ID or recipe ID is incomplete or missing', async () => {
    const req = { userid: 'user123', recipeId: '' }; // Simulating missing recipe ID
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await deleteRecipeByUser(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User ID or recipe ID incomplete or missing' });
  });
});
// Test case for deleteRecipeByRecipeId (DELETE) function
describe('deleteRecipeByRecipeId', () => {
  it('should delete a recipe by recipe ID', async () => {
    // Mock data and setup for the test
    const mockRecipeId = 'recipe123';

    deleteRecipe.mockResolvedValue(); // Mock deleteRecipe function

    const req = { recipeId: mockRecipeId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await deleteRecipeByRecipeId(req, res);

    // Assertions
    expect(deleteRecipe).toHaveBeenCalledWith(mockRecipeId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Recipe deleted successfully' });
  });

  it('should handle error when deleting a recipe by recipe ID', async () => {
    // Mock data and setup for the test
    const mockRecipeId = 'recipe123';

    deleteRecipe.mockRejectedValue(new Error('Mock error'));

    const req = { recipeId: mockRecipeId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await deleteRecipeByRecipeId(req, res);

    // Assertions
    expect(deleteRecipe).toHaveBeenCalledWith(mockRecipeId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting recipe', error: 'Mock error' });
  });

  it('should handle case where recipe ID is incomplete or missing', async () => {
    const req = { recipeId: '' }; // Simulating missing recipe ID
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await deleteRecipeByRecipeId(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Recipe ID incomplete or missing' });
  });
});
// Test case for deleteRecipeIngredientByRecipeId (DELETE) function
describe('deleteRecipeIngredientByRecipeId', () => {
  it('should delete ingredients of a recipe by recipe ID', async () => {
    // Mock data and setup for the test
    const mockRecipeId = 'recipe123';

    deleteRecipeIngredients.mockResolvedValue(); // Mock deleteRecipeIngredients function

    const req = { recipeId: mockRecipeId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await deleteRecipeIngredientByRecipeId(req, res);

    // Assertions
    expect(deleteRecipeIngredients).toHaveBeenCalledWith(mockRecipeId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Recipe ingredients deleted successfully' });
  });

  it('should handle error when deleting ingredients of a recipe by recipe ID', async () => {
    // Mock data and setup for the test
    const mockRecipeId = 'recipe123';

    deleteRecipeIngredients.mockRejectedValue(new Error('Mock error'));

    const req = { recipeId: mockRecipeId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await deleteRecipeIngredientByRecipeId(req, res);

    // Assertions
    expect(deleteRecipeIngredients).toHaveBeenCalledWith(mockRecipeId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting recipe ingredients', error: 'Mock error' });
  });

  it('should handle case where recipe ID is incomplete or missing', async () => {
    const req = { recipeId: '' }; // Simulating missing recipe ID
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await deleteRecipeIngredientByRecipeId(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Recipe ID incomplete or missing' });
  });
});
});
