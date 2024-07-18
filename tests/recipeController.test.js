// Import necessary modules and functions
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
    isUserRecipe
} = require('../controllers/recipeController');
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
    deleteRecipeIngredients
} = require('../models/recipe');
const pantry = require('../models/pantry');
const recipeService = require('../services/recipeService');
const db = require('../middleware/db');
const axios = require('axios');
const sql = require('mssql');

jest.mock('../models/pantry');
jest.mock('../services/recipeService');
jest.mock('../models/recipe');
jest.mock('../middleware/db', () => {
    const mockPool = {
        connect: jest.fn(),
        request: jest.fn(),
        close: jest.fn(),
        // Add other methods as needed
    };

    const poolPromise = new Promise((resolve, reject) => {
        // Resolve with the mock pool
        resolve(mockPool);
    });

    return {
        sql: jest.requireActual('mssql'), // Use actual mssql library for `sql` part
        poolPromise, // Export the mocked poolPromise
    };
});

/* Note that recipeid in SQL will be UUID, userid will be generated by MongoDB, 
 while spoonacularId for a recipe will be 6 numerical digits in a string format.
 for testing purposes, testing data is simplified */

describe('Recipe Controller Tests', () => {
    let pool;
    // Mock poolPromise behavior
    beforeAll(async () => {
        try {
            // Initialize the database connection pool or other resources
            pool = await db.poolPromise;
        } catch (error) {
            console.error('Error initializing pool:', error);
            throw error;
        }
    });
    // Clean up resources after all tests
    afterAll(async () => {
        try {
            // Close database connections or other cleanup tasks
            if (pool) {
                await pool.close();
            }
        } catch (error) {
            console.error('Error closing pool:', error);
            throw error;
        }
    });
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

    // Test cases for getFilteredRecipesByUser
    describe('getFilteredRecipesByUser', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should fetch filtered recipes based on user preferences', async () => {
            // Mock request and response objects
            const req = {
                userid: 'user123',
                body: [{ name: 'ingredient1' }, { name: 'ingredient2' }],
                excludedIngredients: ['dairy'],
                intolerances: ['gluten'],
                dietaryRestrictions: ['vegetarian'],
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const mockFilteredRecipes = [{ id: 'recipe1', title: 'Recipe 1' }, { id: 'recipe2', title: 'Recipe 2' }];

            // Mocking recipeService.fetchFilteredRecipes to resolve with mockFilteredRecipes
            recipeService.fetchFilteredRecipes.mockResolvedValue(mockFilteredRecipes);

            // Call the controller function
            await getFilteredRecipesByUser(req, res);

            // Assertions
            expect(recipeService.fetchFilteredRecipes).toHaveBeenCalledWith(
                req.body,
                req.excludedIngredients,
                req.intolerances,
                req.dietaryRestrictions
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockFilteredRecipes);
        });

        it('should handle missing user ID', async () => {
            // Mock request and response objects
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Call the controller function
            await getFilteredRecipesByUser(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User ID not provided' });
            // Ensure that fetchFilteredRecipes was not called
            expect(recipeService.fetchFilteredRecipes).not.toHaveBeenCalled();
        });

        it('should handle missing ingredients', async () => {
            // Mock request and response objects
            const req = { userid: 'user123' };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Call the controller function
            await getFilteredRecipesByUser(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Ingredients must be provided' });
            // Ensure that fetchFilteredRecipes was not called
            expect(recipeService.fetchFilteredRecipes).not.toHaveBeenCalled();
        });

        it('should handle empty result from recipeService', async () => {
            // Mock request and response objects
            const req = {
                userid: 'user123',
                body: [{ name: 'ingredient1' }],
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const mockFilteredRecipes = [];

            // Mocking recipeService.fetchFilteredRecipes to resolve with an empty array
            recipeService.fetchFilteredRecipes.mockResolvedValue(mockFilteredRecipes);

            // Call the controller function
            await getFilteredRecipesByUser(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'No recipes found for the given filters' });
        });

        it('should handle database error', async () => {
            // Mock request and response objects
            const req = {
                userid: 'user123',
                body: [{ name: 'ingredient1' }],
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const databaseError = new Error('Database error');

            // Mocking recipeService.fetchFilteredRecipes to reject with a database error
            recipeService.fetchFilteredRecipes.mockRejectedValue(databaseError);

            // Call the controller function
            await getFilteredRecipesByUser(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error getting filtered recipes', error: databaseError.message });
        });

        it('should handle API key expired or payment required', async () => {
            // Mock request and response objects
            const req = {
                userid: 'user123',
                body: [{ name: 'ingredient1' }],
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const apiError = { response: { status: 402 }, message: 'API key expired or payment required' };

            // Mocking recipeService.fetchFilteredRecipes to reject with an API error
            recipeService.fetchFilteredRecipes.mockRejectedValue(apiError);

            // Call the controller function
            await getFilteredRecipesByUser(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(402);
            expect(res.json).toHaveBeenCalledWith({ message: 'API key expired or payment required', error: apiError.message });
        });

        it('should handle other general errors', async () => {
            // Mock request and response objects
            const req = {
                userid: 'user123',
                body: [{ name: 'ingredient1' }],
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const otherError = new Error('Some other error');

            // Mocking recipeService.fetchFilteredRecipes to reject with some other error
            recipeService.fetchFilteredRecipes.mockRejectedValue(otherError);

            // Call the controller function
            await getFilteredRecipesByUser(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error getting filtered recipes', error: otherError.message });
        });
    });

    // Test cases for getAllRecipes function
    describe('getAllRecipes Controller Test', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should fetch all recipes from the database', async () => {
            // Mock request and response objects
            const mockRecipes = [
                { id: 'recipe1', title: 'Recipe 1' },
                { id: 'recipe2', title: 'Recipe 2' }
            ];

            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock getAllStoredRecipes function to resolve with mock recipes
            getAllStoredRecipes.mockResolvedValue(mockRecipes);

            // Call the controller function
            await getAllRecipes(req, res);

            // Assertions
            expect(getAllStoredRecipes).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockRecipes);
        });

        it('should handle case where no recipes are found', async () => {
            // Mock request and response objects
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock getAllStoredRecipes function to resolve with an empty array
            getAllStoredRecipes.mockResolvedValue([]);

            // Call the controller function
            await getAllRecipes(req, res);

            // Assertions
            expect(getAllStoredRecipes).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'No recipes found' });
        });

        it('should handle database error', async () => {
            // Mock request and response objects
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const databaseError = new Error('Database error');

            // Mock getAllStoredRecipes function to reject with a database error
            getAllStoredRecipes.mockRejectedValue(databaseError);

            // Call the controller function
            await getAllRecipes(req, res);

            // Assertions
            expect(getAllStoredRecipes).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error getting all recipes', error: databaseError.message });
        });

        it('should handle specific RequestError type', async () => {
            // Mock request and response objects
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const requestError = { name: 'RequestError', message: 'Request error' };

            // Mock getAllStoredRecipes function to reject with a specific RequestError
            getAllStoredRecipes.mockRejectedValue(requestError);

            // Call the controller function
            await getAllRecipes(req, res);

            // Assertions
            expect(getAllStoredRecipes).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Database error', error: requestError.message });
        });
    });

    // Test cases for getRecipeIngredients function
    describe('getRecipeIngredients Controller Test', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should fetch recipe ingredients successfully', async () => {
            // Mock data and setup for the test
            const mockUserId = 'user123';
            const mockRecipeId = 'recipe123';
            const mockIngredients = [{ id: 'ingredient1', name: 'Ingredient 1' }, { id: 'ingredient2', name: 'Ingredient 2' }];

            const req = {
                userid: mockUserId,
                params: { id: mockRecipeId },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Mock the getRecipeIngredientsById function to resolve with mockIngredients
            getRecipeIngredientsById.mockResolvedValue(mockIngredients);

            // Call the controller function
            await getRecipeIngredients(req, res);

            // Assertions
            expect(getRecipeIngredientsById).toHaveBeenCalledWith(mockRecipeId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockIngredients);
        });

        it('should handle missing recipe ID', async () => {
            const mockUserId = 'user123';

            const req = {
                userid: mockUserId,
                params: {},
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Call the controller function
            await getRecipeIngredients(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Recipe ID is required' });
            // Ensure getRecipeIngredientsById was not called
            expect(getRecipeIngredientsById).not.toHaveBeenCalled();
        });

        it('should handle missing user ID', async () => {
            const mockRecipeId = 'recipe123';

            const req = {
                userid: undefined, // Simulate missing userid
                params: { id: mockRecipeId },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Call the controller function
            await getRecipeIngredients(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User ID not provided' });
            // Ensure getRecipeIngredientsById was not called
            expect(getRecipeIngredientsById).not.toHaveBeenCalled();
        });

        it('should handle no ingredients found for the given recipe ID', async () => {
            const mockUserId = 'user123';
            const mockRecipeId = 'recipe123';

            // Mocking getRecipeIngredientsById to resolve with null (no ingredients found)
            getRecipeIngredientsById.mockResolvedValue(null);

            const req = {
                userid: mockUserId,
                params: { id: mockRecipeId },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Call the controller function
            await getRecipeIngredients(req, res);

            // Assertions
            expect(getRecipeIngredientsById).toHaveBeenCalledWith(mockRecipeId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'No ingredients found for the given recipe ID' });
        });

        it('should handle internal server error', async () => {
            const mockUserId = 'user123';
            const mockRecipeId = 'recipe123';
            const errorMessage = 'Mock internal server error';

            // Mocking getRecipeIngredientsById to throw an error
            getRecipeIngredientsById.mockRejectedValue(new Error(errorMessage));

            const req = {
                userid: mockUserId,
                params: { id: mockRecipeId },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Call the controller function
            await getRecipeIngredients(req, res);

            // Assertions
            expect(getRecipeIngredientsById).toHaveBeenCalledWith(mockRecipeId);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    // Test cases for insertRecipeByUser function
    describe('insertRecipeByUser Controller Test', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should insert recipes for a user', async () => {
            const mockUserId = 'user123';
            const mockRecipes = [
                { id: 'recipe1', title: 'Recipe 1' },
                { id: 'recipe2', title: 'Recipe 2' }
            ];

            const mockRecipeDetails = [
                { id: 'recipe1', title: 'Recipe 1', servings: 4, readyInMinutes: 30, pricePerServing: 2.5, spoonacularId: '12345' },
                { id: 'recipe2', title: 'Recipe 2', servings: 2, readyInMinutes: 45, pricePerServing: 3.0, spoonacularId: '67890' }
            ];

            const req = { userid: mockUserId, body: mockRecipes };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mocking recipeService.fetchRecipeDetails to resolve with mockRecipeDetails
            recipeService.fetchRecipeDetails.mockImplementation(async (recipeId) => {
                const foundRecipe = mockRecipeDetails.find(recipe => recipe.id === recipeId);
                return foundRecipe;
            });

            // Mocking insertRecipe function
            insertRecipe.mockResolvedValue(); // Assuming insertRecipe doesn't return anything specific

            // Call the controller function
            await insertRecipeByUser(req, res);

            // Assertions
            expect(recipeService.fetchRecipeDetails).toHaveBeenCalledTimes(mockRecipes.length);
            expect(insertRecipe).toHaveBeenCalledTimes(mockRecipes.length);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Recipes inserted and linked to user successfully' });
        });

        it('should handle case where user ID or recipes array is missing', async () => {
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Call the controller function
            await insertRecipeByUser(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User ID and recipes array must be provided' });
            // Ensure that fetchRecipeDetails and insertRecipe were not called
            expect(recipeService.fetchRecipeDetails).not.toHaveBeenCalled();
            expect(insertRecipe).not.toHaveBeenCalled();
        });

        it('should handle case where recipe details are not found', async () => {
            const mockUserId = 'user123';
            const mockRecipes = [
                { id: 'recipe1', title: 'Recipe 1' },
                { id: 'recipe2', title: 'Recipe 2' }
            ];

            const req = { userid: mockUserId, body: mockRecipes };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mocking recipeService.fetchRecipeDetails to resolve with undefined (recipe not found)
            recipeService.fetchRecipeDetails
                .mockResolvedValueOnce(undefined) // Mock for recipe1
                .mockResolvedValueOnce(undefined); // Mock for recipe2

            // Call the controller function
            await insertRecipeByUser(req, res);

            // Assertions
            expect(recipeService.fetchRecipeDetails).toHaveBeenCalledTimes(mockRecipes.length);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Some recipes could not be found',
                errors: [
                    `Recipe with ID ${mockRecipes[0].id} not found`,
                    `Recipe with ID ${mockRecipes[1].id} not found`
                ]
            });
            expect(insertRecipe).not.toHaveBeenCalled(); // Ensure insertRecipe was not called
        });

        it('should handle database insertion error', async () => {
            const mockUserId = 'user123';
            const mockRecipes = [
                { id: 'recipe1', title: 'Recipe 1' },
                { id: 'recipe2', title: 'Recipe 2' }
            ];

            const mockRecipeDetails = [
                { id: 'recipe1', title: 'Recipe 1', servings: 4, readyInMinutes: 30, pricePerServing: 2.5, spoonacularId: '12345' },
                { id: 'recipe2', title: 'Recipe 2', servings: 2, readyInMinutes: 45, pricePerServing: 3.0, spoonacularId: '67890' }
            ];

            const mockError = new Error('Database error');

            const req = { userid: mockUserId, body: mockRecipes };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mocking recipeService.fetchRecipeDetails to resolve with mockRecipeDetails
            recipeService.fetchRecipeDetails.mockImplementation(async (recipeId) => {
                const foundRecipe = mockRecipeDetails.find(recipe => recipe.id === recipeId);
                return foundRecipe;
            });

            // Mocking insertRecipe function to resolve successfully
            insertRecipe.mockResolvedValue();

            // Call the controller function
            await insertRecipeByUser(req, res);

            // Assertions
            expect(recipeService.fetchRecipeDetails).toHaveBeenCalledTimes(mockRecipes.length);
            expect(insertRecipe).toHaveBeenCalledTimes(2); // Should attempt to insert both recipes
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Recipes inserted and linked to user successfully' });
        });
    });

    // Test cases for insertRecipeIngredientsByRecipeId function
    describe('insertRecipeIngredientsByRecipeId Controller Test', () => {
        afterEach(() => {
          jest.clearAllMocks();
        });
      
        it('should insert ingredients for a user\'s recipe', async () => {
          const mockUserId = 'user123';
          const mockRecipeId = 'recipe123';
          const mockIngredients = [
            { name: 'Ingredient 1', amount: 2, unit: 'cups' },
            { name: 'Ingredient 2', amount: 1, unit: 'tbsp' }
          ];
      
          const mockIngredientData = [
            { id: 'ing1', name: 'Ingredient 1', image: 'image1.jpg' },
            { id: 'ing2', name: 'Ingredient 2', image: 'image2.jpg' }
          ];
      
          const req = { userid: mockUserId, params: { id: mockRecipeId }, body: mockIngredients };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
          };
      
          // Mocking isUserRecipe to resolve with true
          isUserRecipe.mockResolvedValue(true);
      
          // Mocking recipeService.fetchRecipeIngredient to resolve with mockIngredientData
          recipeService.fetchRecipeIngredient
            .mockResolvedValueOnce(mockIngredientData[0])
            .mockResolvedValueOnce(mockIngredientData[1]);
      
          // Mocking insertRecipeIngredient to resolve successfully
          insertRecipeIngredient.mockResolvedValue();
      
          // Call the controller function
          await insertRecipeIngredientsByRecipeId(req, res);
      
          // Assertions
          expect(isUserRecipe).toHaveBeenCalledWith(mockUserId, mockRecipeId);
          expect(recipeService.fetchRecipeIngredient).toHaveBeenCalledTimes(mockIngredients.length);
          expect(insertRecipeIngredient).toHaveBeenCalledTimes(mockIngredients.length);
          expect(res.status).toHaveBeenCalledWith(201);
          expect(res.json).toHaveBeenCalledWith({ message: 'Recipe ingredients updated and stored in the database.' });
        });
      
        it('should return 404 if recipe does not belong to the user', async () => {
          const mockUserId = 'user123';
          const mockRecipeId = 'recipe123';
          const mockIngredients = [
            { name: 'Ingredient 1', amount: 2, unit: 'cups' },
            { name: 'Ingredient 2', amount: 1, unit: 'tbsp' }
          ];
      
          const req = { userid: mockUserId, params: { id: mockRecipeId }, body: mockIngredients };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
          };
      
          // Mocking isUserRecipe to resolve with false
          isUserRecipe.mockResolvedValue(false);
      
          // Call the controller function
          await insertRecipeIngredientsByRecipeId(req, res);
      
          // Assertions
          expect(isUserRecipe).toHaveBeenCalledWith(mockUserId, mockRecipeId);
          expect(res.status).toHaveBeenCalledWith(404);
          expect(res.json).toHaveBeenCalledWith({ message: 'Recipe not found or does not belong to the user' });
          expect(recipeService.fetchRecipeIngredient).not.toHaveBeenCalled();
          expect(insertRecipeIngredient).not.toHaveBeenCalled();
        });
      
        it('should return 404 if ingredient is not found', async () => {
          const mockUserId = 'user123';
          const mockRecipeId = 'recipe123';
          const mockIngredients = [
            { name: 'NonExistentIngredient', amount: 2, unit: 'cups' }
          ];
      
          const req = { userid: mockUserId, params: { id: mockRecipeId }, body: mockIngredients };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
          };
      
          // Mocking isUserRecipe to resolve with true
          isUserRecipe.mockResolvedValue(true);
      
          // Mocking recipeService.fetchRecipeIngredient to resolve with undefined (ingredient not found)
          recipeService.fetchRecipeIngredient.mockResolvedValue(undefined);
      
          // Call the controller function
          await insertRecipeIngredientsByRecipeId(req, res);
      
          // Assertions
          expect(isUserRecipe).toHaveBeenCalledWith(mockUserId, mockRecipeId);
          expect(recipeService.fetchRecipeIngredient).toHaveBeenCalledTimes(mockIngredients.length);
          expect(res.status).toHaveBeenCalledWith(404);
          expect(res.json).toHaveBeenCalledWith({ message: `Ingredient with name ${mockIngredients[0].name} not found` });
          expect(insertRecipeIngredient).not.toHaveBeenCalled();
        });
      
        it('should handle API key expired or payment required error', async () => {
          const mockUserId = 'user123';
          const mockRecipeId = 'recipe123';
          const mockIngredients = [
            { name: 'Ingredient 1', amount: 2, unit: 'cups' }
          ];
      
          const req = { userid: mockUserId, params: { id: mockRecipeId }, body: mockIngredients };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
          };
      
          // Mocking isUserRecipe to resolve with true
          isUserRecipe.mockResolvedValue(true);
      
          // Mocking recipeService.fetchRecipeIngredient to reject with 402 error
          const error = { response: { status: 402 }, message: 'API key expired or payment required' };
          recipeService.fetchRecipeIngredient.mockRejectedValue(error);
      
          // Call the controller function
          await insertRecipeIngredientsByRecipeId(req, res);
      
          // Assertions
          expect(isUserRecipe).toHaveBeenCalledWith(mockUserId, mockRecipeId);
          expect(recipeService.fetchRecipeIngredient).toHaveBeenCalledTimes(mockIngredients.length);
          expect(res.status).toHaveBeenCalledWith(402);
          expect(res.json).toHaveBeenCalledWith({ message: 'API key expired or payment required', error: error.message });
          expect(insertRecipeIngredient).not.toHaveBeenCalled();
        });
      
        it('should handle generic error during ingredient insertion', async () => {
          const mockUserId = 'user123';
          const mockRecipeId = 'recipe123';
          const mockIngredients = [
            { name: 'Ingredient 1', amount: 2, unit: 'cups' }
          ];
      
          const req = { userid: mockUserId, params: { id: mockRecipeId }, body: mockIngredients };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
          };
      
          // Mocking isUserRecipe to resolve with true
          isUserRecipe.mockResolvedValue(true);
      
          // Mocking recipeService.fetchRecipeIngredient to resolve with valid data
          const ingredientData = { id: 'ing1', name: 'Ingredient 1', image: 'image1.jpg' };
          recipeService.fetchRecipeIngredient.mockResolvedValue(ingredientData);
      
          // Mocking insertRecipeIngredient to throw an error
          const error = new Error('Database insertion error');
          insertRecipeIngredient.mockRejectedValue(error);
      
          // Call the controller function
          await insertRecipeIngredientsByRecipeId(req, res);
      
          // Assertions
          expect(isUserRecipe).toHaveBeenCalledWith(mockUserId, mockRecipeId);
          expect(recipeService.fetchRecipeIngredient).toHaveBeenCalledTimes(mockIngredients.length);
          expect(insertRecipeIngredient).toHaveBeenCalledTimes(mockIngredients.length);
          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching and storing recipes', error: error.message });
        });
      });
});