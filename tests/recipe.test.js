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
});