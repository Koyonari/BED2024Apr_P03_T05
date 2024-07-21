const sql = require('mssql');
const { dbConfig } = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid'); // Import uuidv4
const {
  getRecipeById,
  getRecipesByUserId,
  getAllStoredRecipes,
  getRecipeIngredientsById,
  insertRecipeDetails,
  insertRecipeIngredient,
  updateRecipeDetails,
  updateRecipeDetailsbyUser,
  insertOrUpdateIngredient,
  linkRecipeIngredient,
  linkUserToRecipe,
  editRecipe,
  deleteRecipe,
  deleteRecipeIngredients
} = require('../models/recipe');
const { fi } = require('date-fns/locale');

// Mocking mssql module
jest.mock('mssql');
// Mock data
const mockRecipe = {
  id: '1',
  title: 'Spaghetti Bolognese',
  imageurl: 'http://example.com/image.jpg',
  servings: 4,
  readyInMinutes: 30,
  pricePerServing: 5.0,
  spoonacularId: '12345',
  userId: 'user1'
};

const mockRecipes = [mockRecipe];

const mockRequest = {
  input: jest.fn().mockReturnThis(),
  query: jest.fn()
};

const mockConnection = {
  request: jest.fn().mockReturnValue(mockRequest),
  close: jest.fn().mockResolvedValue(undefined)
};
// Create mock constructors for SQL types
sql.Int = jest.fn().mockImplementation(() => 'mockConstructor');
sql.Float = jest.fn().mockImplementation(() => 'mockConstructor');
sql.VarChar = jest.fn().mockImplementation(() => 'mockConstructor');
sql.NVarChar = jest.fn().mockImplementation(() => 'mockConstructor');
// Mock data for getRecipeIngredientsById
const mockIngredients = [
  {
    ingredient_id: 'ing1',
    ingredient_name: 'Tomato',
    ingredient_image: 'http://example.com/tomato.jpg',
    amount: 2.5,
    unit: 'cups'
  }
];

const mockTransaction = {
  begin: jest.fn().mockResolvedValue(undefined),
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined),
  request: jest.fn().mockReturnValue(mockRequest)
};

describe('Recipe Module Tests', () => {
  beforeAll(() => {
    sql.connect = jest.fn().mockResolvedValue(mockConnection);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('getRecipesByUserId', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return recipes for a given user ID', async () => {
      mockRequest.query.mockResolvedValue({ recordset: mockRecipes });
      sql.connect.mockResolvedValue(mockConnection);

      const userId = 'user1';
      const result = await getRecipesByUserId(userId);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockRequest.input).toHaveBeenCalledWith('userId', sql.VarChar(255), userId);
      expect(mockRequest.query).toHaveBeenCalledWith(expect.any(String));
      expect(result).toEqual(mockRecipes);
    });

    it('should throw an error if the query fails', async () => {
      const error = new Error('Query failed');
      mockRequest.query.mockRejectedValue(error);
      sql.connect.mockResolvedValue(mockConnection);

      await expect(getRecipesByUserId('user1')).rejects.toThrow('Query failed');
    });
  });

  describe('getRecipeById', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a recipe for a given recipe ID', async () => {
      mockRequest.query.mockResolvedValue({ recordset: [mockRecipe] });
      sql.connect.mockResolvedValue(mockConnection);

      const recipeId = '1';
      const result = await getRecipeById(recipeId);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockRequest.input).toHaveBeenCalledWith('recipeId', sql.VarChar(255), recipeId);
      expect(mockRequest.query).toHaveBeenCalledWith(expect.any(String));
      expect(result).toEqual(mockRecipe);
    });

    it('should return null if no recipe is found', async () => {
      mockRequest.query.mockResolvedValue({ recordset: [] });
      sql.connect.mockResolvedValue(mockConnection);

      const recipeId = '1';
      const result = await getRecipeById(recipeId);

      expect(result).toBeNull();
    });

    it('should throw an error if the query fails', async () => {
      const error = new Error('Query failed');
      mockRequest.query.mockRejectedValue(error);
      sql.connect.mockResolvedValue(mockConnection);

      await expect(getRecipeById('1')).rejects.toThrow('Query failed');
    });
  });

  describe('getAllStoredRecipes', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return all stored recipes', async () => {
      mockRequest.query.mockResolvedValue({ recordset: mockRecipes });
      sql.connect.mockResolvedValue(mockConnection);

      const result = await getAllStoredRecipes();

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockRequest.query).toHaveBeenCalledWith(expect.any(String));
      expect(result).toEqual(mockRecipes);
    });

    it('should throw an error if the query fails', async () => {
      const error = new Error('Query failed');
      mockRequest.query.mockRejectedValue(error);
      sql.connect.mockResolvedValue(mockConnection);

      await expect(getAllStoredRecipes()).rejects.toThrow('Query failed');
    });
  });

  describe('getRecipeIngredientsById', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return recipe ingredients for a given recipe ID', async () => {
      mockRequest.query.mockResolvedValue({ recordset: mockIngredients });
      sql.connect.mockResolvedValue(mockConnection);

      const recipeId = '1';
      const result = await getRecipeIngredientsById(recipeId);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockRequest.input).toHaveBeenCalledWith('recipeId', sql.VarChar(255), recipeId);
      expect(mockRequest.query).toHaveBeenCalledWith(expect.any(String));
      expect(result).toEqual(mockIngredients);
    });

    it('should return null if no ingredients are found for the given recipe ID', async () => {
      mockRequest.query.mockResolvedValue({ recordset: [] });
      sql.connect.mockResolvedValue(mockConnection);

      const recipeId = '1';
      const result = await getRecipeIngredientsById(recipeId);

      expect(result).toBeNull();
    });

    it('should throw an error if the query fails', async () => {
      const error = new Error('Query failed');
      mockRequest.query.mockRejectedValue(error);
      sql.connect.mockResolvedValue(mockConnection);

      await expect(getRecipeIngredientsById('1')).rejects.toThrow('Query failed');
    });
  });

  describe('insertRecipeDetails', () => {
    let mockConnection;
    let mockRequest;
    const fixedUuid = '69b4636c-aaa4-433d-ae85-0db58fbd56c7'; // Fixed UUID for testing

    beforeEach(() => {
      mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
      };
      mockConnection = {
        request: jest.fn(() => mockRequest)
      };
      sql.connect.mockResolvedValue(mockConnection);
    });

    it('should insert a new recipe and return the new recipe ID', async () => {
      const mockRecipe = {
        id: '12345',
        title: 'Spaghetti Bolognese',
        image: 'http://example.com/image.jpg',
        servings: 4,
        readyInMinutes: 30,
        pricePerServing: 5,
        spoonacularId: '12345'
      };

      // Simulate no existing recipe and successful insert
      mockRequest.query
        .mockResolvedValueOnce({ recordset: [] }) // No existing recipe
        .mockResolvedValueOnce({ recordset: [{ id_insert: fixedUuid }] }); // Insert query returns fixed UUID

      const result = await insertRecipeDetails(mockConnection, mockRecipe, 'user1', () => fixedUuid);

      // Log mock inputs for debugging
      console.log('Mock inputs:', mockRequest.input.mock.calls);

      // Check if the input values and result match expected values
      expect(mockRequest.input).toHaveBeenCalledWith('id_insert', sql.VarChar(255), fixedUuid);
      expect(mockRequest.input).toHaveBeenCalledWith('title', sql.NVarChar, mockRecipe.title);
      expect(mockRequest.input).toHaveBeenCalledWith('imageurl', sql.NVarChar, mockRecipe.image || '');
      expect(mockRequest.input).toHaveBeenCalledWith('servings', sql.Int, mockRecipe.servings);
      expect(mockRequest.input).toHaveBeenCalledWith('readyInMinutes', sql.Int, mockRecipe.readyInMinutes);
      expect(mockRequest.input).toHaveBeenCalledWith('pricePerServing', sql.Float, mockRecipe.pricePerServing);
      expect(mockRequest.input).toHaveBeenCalledWith('spoonacularId', sql.VarChar(255), mockRecipe.spoonacularId);
      expect(mockRequest.query).toHaveBeenCalledWith(expect.any(String));
      expect(result).toEqual({ recipeId: fixedUuid });
    });

    it('should throw an error if recipe object is invalid', async () => {
      const invalidRecipe = { id: '12345' }; // Missing title

      await expect(insertRecipeDetails(mockConnection, invalidRecipe, 'user1'))
        .rejects.toThrow('Recipe object, id, or title is undefined');
    });

    it('should throw an error if the query fails', async () => {
      const error = new Error('Query failed');

      mockRequest.query.mockRejectedValueOnce(error); // Fail on checking existing recipe

      await expect(insertRecipeDetails(mockConnection, mockRecipe, 'user1'))
        .rejects.toThrow('Query failed');
    });

    it('should handle errors when inserting or updating recipes', async () => {
      mockRequest.query.mockResolvedValueOnce({ recordset: [] }) // No existing recipe
        .mockRejectedValueOnce(new Error('Insert/Update failed')); // Fail on insert query

      await expect(insertRecipeDetails(mockConnection, mockRecipe, 'user1'))
        .rejects.toThrow('Insert/Update failed');
    });
  });
  describe('updateRecipeDetails', () => {
    let mockConnection;
    let mockRequest;

    beforeEach(() => {
      mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
      };
      mockConnection = {
        request: jest.fn(() => mockRequest)
      };
      sql.connect.mockResolvedValue(mockConnection);
    });

    it('should update recipe details successfully', async () => {
      const mockRecipe = {
        id: '12345',
        title: 'Updated Spaghetti Bolognese',
        image: 'http://example.com/new-image.jpg',
        servings: 4,
        readyInMinutes: 30,
        pricePerServing: 6,
        spoonacularId: '12345'
      };
      const recipeId = '12345';

      // Simulate successful query
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });

      // Call the function
      await updateRecipeDetails(mockConnection, mockRecipe, recipeId);

      // Verify that input parameters are set correctly
      expect(mockRequest.input).toHaveBeenCalledWith('id_update', sql.VarChar(255), recipeId);
      expect(mockRequest.input).toHaveBeenCalledWith('title', sql.NVarChar, mockRecipe.title);
      expect(mockRequest.input).toHaveBeenCalledWith('imageurl', sql.NVarChar, mockRecipe.image || '');
      expect(mockRequest.input).toHaveBeenCalledWith('servings', sql.Int, mockRecipe.servings);
      expect(mockRequest.input).toHaveBeenCalledWith('readyInMinutes', sql.Int, mockRecipe.readyInMinutes);
      expect(mockRequest.input).toHaveBeenCalledWith('pricePerServing', sql.Float, mockRecipe.pricePerServing);
      expect(mockRequest.input).toHaveBeenCalledWith('spoonacularId', sql.VarChar(255), mockRecipe.id.toString());

      // Verify that the query method was called with the correct SQL update query
      expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE Recipes'));
    });

    it('should throw an error if recipe object is invalid', async () => {
      const invalidRecipe = { id: '12345' }; // Missing title

      await expect(updateRecipeDetails(mockConnection, invalidRecipe, '12345'))
        .rejects.toThrow('Recipe object, id, or title is undefined');
    });

    it('should handle errors from the database query', async () => {
      const mockRecipe = {
        id: '12345',
        title: 'Updated Spaghetti Bolognese',
        image: 'http://example.com/new-image.jpg',
        servings: 4,
        readyInMinutes: 30,
        pricePerServing: 6,
        spoonacularId: '12345'
      };
      const recipeId = '12345';
      const error = new Error('Query failed');

      // Simulate query failure
      mockRequest.query.mockRejectedValueOnce(error);

      await expect(updateRecipeDetails(mockConnection, mockRecipe, recipeId))
        .rejects.toThrow('Query failed');
    });
  });
describe('updateRecipeDetailsbyUser', () => {
    let mockConnection;
    let mockRequest;

    beforeEach(() => {
        // Initialize mockRequest and mockConnection
        mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn()
        };
        mockConnection = {
            request: jest.fn(() => mockRequest)
        };
        sql.connect = jest.fn().mockResolvedValue(mockConnection); // Mock sql.connect to return mockConnection
    });

    it('should update recipe details successfully', async () => {
        const mockRecipe = {
            id: '12345',
            title: 'Updated Spaghetti Bolognese',
            imageurl: 'http://example.com/new-image.jpg',
            servings: 4,
            readyInMinutes: 30,
            pricePerServing: 6,
            spoonacularId: '12345'
        };

        // Simulate successful query
        mockRequest.query.mockResolvedValueOnce({ recordset: [] });

        // Call the function
        await updateRecipeDetailsbyUser(mockRecipe);

        // Verify that input parameters are set correctly
        expect(mockRequest.input).toHaveBeenCalledWith('id_update', sql.VarChar(255), mockRecipe.id.toString());
        expect(mockRequest.input).toHaveBeenCalledWith('title', sql.VarChar, mockRecipe.title);
        expect(mockRequest.input).toHaveBeenCalledWith('imageurl', sql.VarChar, mockRecipe.imageurl);
        expect(mockRequest.input).toHaveBeenCalledWith('servings', sql.Int, mockRecipe.servings);
        expect(mockRequest.input).toHaveBeenCalledWith('readyInMinutes', sql.Int, mockRecipe.readyInMinutes);
        expect(mockRequest.input).toHaveBeenCalledWith('pricePerServing', sql.Float, mockRecipe.pricePerServing);
        expect(mockRequest.input).toHaveBeenCalledWith('spoonacularId', sql.VarChar(255), mockRecipe.spoonacularId);

        // Verify that the query method was called with the correct SQL update query
        expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE Recipes'));
    });

    it('should update recipe details without spoonacularId if not provided', async () => {
        const mockRecipe = {
            id: '12345',
            title: 'Updated Spaghetti Bolognese',
            imageurl: 'http://example.com/new-image.jpg',
            servings: 4,
            readyInMinutes: 30,
            pricePerServing: 6
        };

        // Simulate successful query
        mockRequest.query.mockResolvedValueOnce({ recordset: [] });

        // Call the function
        await updateRecipeDetailsbyUser(mockRecipe);

        // Verify that input parameters are set correctly
        expect(mockRequest.input).toHaveBeenCalledWith('id_update', sql.VarChar(255), mockRecipe.id.toString());
        expect(mockRequest.input).toHaveBeenCalledWith('title', sql.VarChar, mockRecipe.title);
        expect(mockRequest.input).toHaveBeenCalledWith('imageurl', sql.VarChar, mockRecipe.imageurl);
        expect(mockRequest.input).toHaveBeenCalledWith('servings', sql.Int, mockRecipe.servings);
        expect(mockRequest.input).toHaveBeenCalledWith('readyInMinutes', sql.Int, mockRecipe.readyInMinutes);
        expect(mockRequest.input).toHaveBeenCalledWith('pricePerServing', sql.Float, mockRecipe.pricePerServing);

        // Verify that input for spoonacularId is not included
        expect(mockRequest.input).not.toHaveBeenCalledWith('spoonacularId', sql.VarChar(255), expect.anything());

        // Verify that the query method was called with the correct SQL update query
        expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE Recipes'));
    });

    it('should throw an error if recipe object is invalid', async () => {
        const invalidRecipe = { id: '12345' }; // Missing title

        await expect(updateRecipeDetailsbyUser(invalidRecipe))
            .rejects.toThrow('Recipe object, id, or title is undefined');
    });

    it('should handle errors from the database connection', async () => {
        const mockRecipe = {
            id: '12345',
            title: 'Updated Spaghetti Bolognese',
            imageurl: 'http://example.com/new-image.jpg',
            servings: 4,
            readyInMinutes: 30,
            pricePerServing: 6,
            spoonacularId: '12345'
        };
        const error = new Error('Connection failed');

        // Simulate connection failure
        sql.connect.mockRejectedValueOnce(error);

        await expect(updateRecipeDetailsbyUser(mockRecipe))
            .rejects.toThrow('Connection failed');
    });

    it('should handle errors from the database query', async () => {
        const mockRecipe = {
            id: '12345',
            title: 'Updated Spaghetti Bolognese',
            imageurl: 'http://example.com/new-image.jpg',
            servings: 4,
            readyInMinutes: 30,
            pricePerServing: 6,
            spoonacularId: '12345'
        };
        const queryError = new Error('Query failed');

        // Simulate query failure
        mockRequest.query.mockRejectedValueOnce(queryError);

        await expect(updateRecipeDetailsbyUser(mockRecipe))
            .rejects.toThrow('Query failed');
    });
});

  describe('insertOrUpdateIngredient', () => {
    let mockConnection;
    let mockRequest;

    beforeEach(() => {
      mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
      };
      mockConnection = {
        request: jest.fn(() => mockRequest)
      };
      sql.connect.mockResolvedValue(mockConnection);
    });

    it('should insert or update ingredient successfully', async () => {
      const mockIngredient = {
        id: 'ingredient-1',
        name: 'Tomato',
        image: 'http://example.com/tomato.jpg'
      };

      // Simulate a successful query
      mockRequest.query.mockResolvedValueOnce({});

      // Call the function
      await insertOrUpdateIngredient(mockConnection, mockIngredient);

      // Verify that input parameters are set correctly
      expect(mockRequest.input).toHaveBeenCalledWith('id_insertOrUpdate', sql.VarChar(255), mockIngredient.id.toString());
      expect(mockRequest.input).toHaveBeenCalledWith('name', sql.NVarChar, mockIngredient.name);
      expect(mockRequest.input).toHaveBeenCalledWith('image', sql.NVarChar, mockIngredient.image || '');

      // Verify that the query method was called with the correct SQL MERGE query
      expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('MERGE INTO Ingredients'));
    });

    it('should handle errors from the database query', async () => {
      const mockIngredient = {
        id: 'ingredient-1',
        name: 'Tomato',
        image: 'http://example.com/tomato.jpg'
      };
      const queryError = new Error('Query failed');

      mockRequest.query.mockRejectedValueOnce(queryError);

      await expect(insertOrUpdateIngredient(mockConnection, mockIngredient))
        .rejects.toThrow('Error inserting/updating ingredient: Query failed');
    });
  });
  describe('linkRecipeIngredient', () => {
    let mockConnection;
    let mockRequest;

    beforeEach(() => {
      mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
      };
      mockConnection = {
        request: jest.fn(() => mockRequest)
      };
      sql.connect = jest.fn().mockResolvedValue(mockConnection);
    });

    it('should link recipe to ingredient when combination does not exist', async () => {
      const recipeId = 'recipe-1';
      const mockIngredient = {
        id: 'ingredient-1',
        amount: 2.5,
        unit: 'grams'
      };

      // Simulate no existing combination
      mockRequest.query.mockResolvedValueOnce({ recordset: [{ count: 0 }] });

      await linkRecipeIngredient(mockConnection, recipeId, mockIngredient);

      expect(mockRequest.input).toHaveBeenCalledWith('recipeId', sql.VarChar(255), recipeId);
      expect(mockRequest.input).toHaveBeenCalledWith('ingredientId', sql.VarChar(255), mockIngredient.id.toString());
      expect(mockRequest.input).toHaveBeenCalledWith('amount', sql.Float, mockIngredient.amount);
      expect(mockRequest.input).toHaveBeenCalledWith('unit', sql.NVarChar, mockIngredient.unit);

      expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO RecipeIngredients'));
    });

    it('should not insert when recipe-ingredient combination already exists', async () => {
      const recipeId = 'recipe-1';
      const mockIngredient = {
        id: 'ingredient-1',
        amount: 2.5,
        unit: 'grams'
      };

      // Simulate existing combination
      mockRequest.query.mockResolvedValueOnce({ recordset: [{ count: 1 }] });

      await linkRecipeIngredient(mockConnection, recipeId, mockIngredient);

      expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('SELECT COUNT(*) AS count'));
      expect(mockRequest.query).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO RecipeIngredients'));
    });

    it('should handle errors during query execution', async () => {
      const recipeId = 'recipe-1';
      const mockIngredient = {
        id: 'ingredient-1',
        amount: 2.5,
        unit: 'grams'
      };
      const queryError = new Error('Query failed');

      mockRequest.query.mockRejectedValueOnce(queryError);

      await expect(linkRecipeIngredient(mockConnection, recipeId, mockIngredient))
        .rejects.toThrow('Error linking recipe to ingredient: Query failed');
    });
  });
  describe('linkUserToRecipe', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should link user to recipe if not already linked', async () => {
      // Mocking the result for checkQuery
      mockConnection.request()
        .input('userId', sql.VarChar(255), 'user-1')
        .input('recipeId', sql.VarChar(255), 'recipe-1')
        .query.mockResolvedValueOnce({ recordset: [{ count: 0 }] }) // No existing link
        .mockResolvedValueOnce({ recordset: [] }); // No need to mock insert query result

      await linkUserToRecipe(mockConnection, 'user-1', 'recipe-1');

      expect(mockConnection.request().input).toHaveBeenCalledWith('userId', sql.VarChar(255), 'user-1');
      expect(mockConnection.request().input).toHaveBeenCalledWith('recipeId', sql.VarChar(255), 'recipe-1');
      expect(mockConnection.request().query).toHaveBeenCalledWith(expect.any(String));
    });
    it('should not link user to recipe if already linked', async () => {
      // Mocking the result for checkQuery
      mockConnection.request()
        .input('userId', sql.VarChar(255), 'user-1')
        .input('recipeId', sql.VarChar(255), 'recipe-1')
        .query.mockResolvedValueOnce({ recordset: [{ count: 1 }] }); // Existing link

      await linkUserToRecipe(mockConnection, 'user-1', 'recipe-1');

      // Ensure that the checkQuery was called exactly once
      expect(mockConnection.request().query).toHaveBeenCalledTimes(1);
    });
    it('should handle errors during database operations', async () => {
      const errorMessage = 'Database error';
      const queryError = new Error(errorMessage);

      // Mocking the result for checkQuery to throw an error
      mockConnection.request()
        .input('userId', sql.VarChar(255), 'user-1')
        .input('recipeId', sql.VarChar(255), 'recipe-1')
        .query.mockRejectedValueOnce(queryError);

      await expect(linkUserToRecipe(mockConnection, 'user-1', 'recipe-1'))
        .rejects.toThrow(`Error linking user to recipe: ${errorMessage}`);
    });
  });
  describe('editRecipe', () => {
    let mockConnection;
    let mockRequest;
    sql.Int = jest.fn().mockImplementation(() => 'mockConstructor');
    sql.Float = jest.fn().mockImplementation(() => 'mockConstructor');
    sql.VarChar = jest.fn().mockImplementation(() => 'mockConstructor');
    sql.NVarChar = jest.fn().mockImplementation(() => 'mockConstructor');
    beforeEach(() => {
      mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
      };
      mockConnection = {
        request: jest.fn(() => mockRequest),
        close: jest.fn().mockResolvedValue(undefined)
      };
      sql.connect.mockResolvedValue(mockConnection);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should update recipe details successfully', async () => {
      const recipeId = '12345';
      const updates = {
        title: 'Updated Spaghetti Bolognese',
        imageurl: 'http://example.com/new-image.jpg',
        servings: 4,
        readyInMinutes: 30,
        pricePerServing: 6.0
      };

      // Call the function
      await editRecipe(recipeId, updates);

      // Extract calls to `input`
      const inputCalls = mockRequest.input.mock.calls;
      // Verify that input parameters are set correctly
      const servingsCall = inputCalls.find(call => call[0] === 'servings');
      expect(servingsCall).toEqual(['servings', expect.any(Function), updates.servings]);
      // Verify that the query method was called with the correct SQL update query
      expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE Recipes'));
    });
    it('should throw an error if no fields are provided', async () => {
      const recipeId = '123';
      const updates = {}; // No updates

      // Mock the SQL pool and request
      sql.connect = jest.fn().mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        close: jest.fn().mockResolvedValue(),
      });


      await expect(editRecipe(recipeId, updates)).rejects.toThrow('No fields to update');
    });
    it('should throw an error for unsupported data types', async () => {
      const recipeId = '123';
      const updates = {
        customField: { some: 'object' }, // Unsupported data type
      };

      // Mock the SQL pool
      const mockRequest = {
        input: jest.fn(),
        query: jest.fn(),
      };

      // Mock SQL connection and request
      sql.connect = jest.fn().mockResolvedValue({
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(),
      });

      // Mock the query method to throw an error
      mockRequest.input.mockImplementation((name, type, value) => {
        if (typeof value === 'object') {
          throw new Error(`Unsupported data type for field ${name}`);
        }
        return mockRequest;
      });

      await expect(editRecipe(recipeId, updates)).rejects.toThrow('Unsupported data type for field customField');
    });

    it('should handle database connection errors', async () => {
      const recipeId = '123';
      const updates = {
        title: 'New Recipe Title',
      };

      // Mock SQL connection to simulate a connection error
      sql.connect = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      // Run the test and expect it to throw the database connection error
      await expect(editRecipe(recipeId, updates)).rejects.toThrow('Database connection failed');
    });

    it('should handle database query errors', async () => {
      const recipeId = '123';
      const updates = {
        title: 'New Recipe Title',
      };

      // Mock the SQL pool and request
      sql.connect = jest.fn().mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(new Error('Query failed')),
        close: jest.fn().mockResolvedValue(),
      });

      await expect(editRecipe(recipeId, updates)).rejects.toThrow('Query failed');
    });
    it('should close the database connection after execution', async () => {
      const recipeId = '123';
      const updates = {
        title: 'New Recipe Title',
      };

      const mockClose = jest.fn().mockResolvedValue();

      // Mock the SQL pool and request
      sql.connect = jest.fn().mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({}),
        close: mockClose,
      });

      await editRecipe(recipeId, updates);

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('deleteRecipe', () => {
    let mockConnection;
    let mockTransaction;
    let mockRequest1;
    let mockRequest2;
    let mockRequest3;

    beforeEach(() => {
        // Create mock request objects
        mockRequest1 = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({})
        };

        mockRequest2 = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({})
        };

        mockRequest3 = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({})
        };

        // Create a mock transaction object
        mockTransaction = {
            begin: jest.fn().mockResolvedValue(),
            commit: jest.fn().mockResolvedValue(),
            rollback: jest.fn().mockResolvedValue()
        };

        // Mock sql.Transaction to return the mock transaction object
        sql.Transaction = jest.fn().mockImplementation(() => mockTransaction);

        // Create a mock connection object
        mockConnection = {
            transaction: jest.fn().mockReturnValue(mockTransaction),
            close: jest.fn().mockResolvedValue()
        };

        // Mock SQL connection
        sql.connect = jest.fn().mockResolvedValue(mockConnection);

        // Mock SQL request creation to return the different mock requests
        sql.Request = jest.fn()
            .mockImplementationOnce(() => mockRequest1)
            .mockImplementationOnce(() => mockRequest2)
            .mockImplementationOnce(() => mockRequest3);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete a recipe and associated data successfully', async () => {
        const recipeId = '12345';

        // Call the function
        await deleteRecipe(recipeId);

        // Verify that the transaction methods were called
        expect(mockTransaction.begin).toHaveBeenCalled();
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(mockTransaction.rollback).not.toHaveBeenCalled(); // Should not be called on success

        // Verify that the delete queries were called with the correct parameters
        expect(mockRequest1.input).toHaveBeenCalledWith('recipeId', sql.VarChar(255), recipeId);
        expect(mockRequest1.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM RecipeIngredients'));
        expect(mockRequest2.input).toHaveBeenCalledWith('recipeId', sql.VarChar(255), recipeId);
        expect(mockRequest2.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM UserRecipes'));
        expect(mockRequest3.input).toHaveBeenCalledWith('recipeId', sql.VarChar(255), recipeId);
        expect(mockRequest3.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM Recipes'));

        // Verify that the connection close method was called
        expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should handle errors during deletion and rollback transaction', async () => {
        const recipeId = '12345';
        const errorMessage = 'Deletion failed';

        // Mock query to throw an error on the first request
        mockRequest1.query.mockRejectedValueOnce(new Error(errorMessage));

        // Expect the deleteRecipe function to throw an error
        await expect(deleteRecipe(recipeId)).rejects.toThrow(errorMessage);

        // Verify that the transaction methods were called
        expect(mockTransaction.begin).toHaveBeenCalled();
        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(mockTransaction.commit).not.toHaveBeenCalled(); // Should not be called on failure

        // Verify that the connection close method was called
        expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should handle database query errors during transaction', async () => {
        const recipeId = '12345';
        const errorMessage = 'Query failed';

        // Mock query to throw an error on the second request
        mockRequest2.query.mockRejectedValueOnce(new Error(errorMessage));

        // Expect the deleteRecipe function to throw an error
        await expect(deleteRecipe(recipeId)).rejects.toThrow(errorMessage);

        // Verify that the transaction methods were called
        expect(mockTransaction.begin).toHaveBeenCalled();
        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(mockTransaction.commit).not.toHaveBeenCalled(); // Should not be called on failure

        // Verify that the connection close method was called
        expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should close the database connection after execution', async () => {
        const recipeId = '12345';

        // Call the function
        await deleteRecipe(recipeId);

        // Verify that the connection close method was called
        expect(mockConnection.close).toHaveBeenCalled();
    });
});

  describe('deleteRecipeIngredients', () => {
    let mockConnection;
    let mockTransaction;
    let mockRequest;
  
    beforeEach(() => {
      // Define mocks for request and transaction
      mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
      };
  
      mockTransaction = {
        begin: jest.fn().mockResolvedValue(),
        request: jest.fn().mockReturnValue(mockRequest),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue()
      };
  
      // Define mock for connection
      mockConnection = {
        transaction: jest.fn().mockReturnValue(mockTransaction),
        close: jest.fn().mockResolvedValue()
      };
  
      // Mock sql.connect to return mockConnection
      sql.connect = jest.fn().mockResolvedValue(mockConnection);
  
      // Mock sql.Transaction to return mockTransaction
      sql.Transaction = jest.fn().mockImplementation(() => mockTransaction);
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should delete an ingredient from a recipe successfully', async () => {
      // Mock the query result for checking ingredient existence
      mockRequest.query.mockResolvedValueOnce({ recordset: [{ '': 1 }] });
  
      // Mock the query result for deletion
      mockRequest.query.mockResolvedValueOnce({});
  
      // Call the function
      await deleteRecipeIngredients('recipe123', 'ingredient456');
  
      // Assertions
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockTransaction.begin).toHaveBeenCalled();
      expect(mockTransaction.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('recipeId', sql.VarChar(255), 'recipe123');
      expect(mockRequest.input).toHaveBeenCalledWith('ingredientId', sql.VarChar(255), 'ingredient456');
      expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('SELECT COUNT(*)'));
      expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM RecipeIngredients'));
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled(); 
    });

    it('should throw an error if the ingredient does not exist', async () => {
      // Mock the query result for checking ingredient existence
      mockRequest.query.mockResolvedValueOnce({ recordset: [{ '': 0 }] });

      await expect(deleteRecipeIngredients('recipe123', 'ingredient456')).rejects.toThrow('Ingredient does not exist in the specified recipe');

      // Assertions
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should handle errors during deletion and rollback transaction', async () => {
      // Mock the query result for checking ingredient existence
      mockRequest.query.mockResolvedValueOnce({ recordset: [{ '': 1 }] });
      // Simulate an error during deletion
      mockRequest.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(deleteRecipeIngredients('recipe123', 'ingredient456')).rejects.toThrow('Database error');

      // Assertions
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});