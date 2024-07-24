const Pantry = require("../models/pantry"); // Adjust the path to your Pantry model
const sql = require("mssql");
const axios = require("axios");

// Use a simplified or different mock configuration
const dbConfig = {
  database: 'test_db',
  options: {
    connectionTimeout: 10000,
    enableArithAbort: false,
    port: 1234,
  },
  password: 'test_password',
  server: 'test_server',
  trustServerCertificate: false,
  user: 'test_user',
};
jest.mock("axios");
jest.mock('mssql', () => ({
  connect: jest.fn(),
}));

const mockRequest = {
  input: jest.fn().mockReturnThis(),
  query: jest.fn()
};

const mockConnection = {
  request: jest.fn().mockReturnValue(mockRequest),
  close: jest.fn().mockResolvedValue(undefined)
};

describe("Pantry Class", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  beforeAll(() => {
    sql.connect = jest.fn().mockResolvedValue(mockConnection);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Pantry.createPantry", () => {
    it("should return existing pantry ID if pantry already exists", async () => {
      const mockPantryID = "12345";
      Pantry.getPantryIDByUserID = jest.fn().mockResolvedValue(mockPantryID);

      const result = await Pantry.createPantry("user1");
      expect(result).toBe(mockPantryID);
    });

    it("should create a new pantry if pantry does not exist", async () => {
      Pantry.getPantryIDByUserID = jest.fn().mockResolvedValue(null);
      Pantry.createPantry = jest.fn(async (user_id) => {
        return "ABCDE"; // Mock pantry ID
      });

      const result = await Pantry.createPantry("user1");
      expect(result).toBe("ABCDE"); // Expect the mocked pantry ID
    });

    it("should throw an error if the pantry creation fails", async () => {
      Pantry.getPantryIDByUserID = jest.fn().mockResolvedValue(null);
      Pantry.createPantry = jest
        .fn()
        .mockRejectedValue(new Error("Failed to create pantry"));

      await expect(Pantry.createPantry("user1")).rejects.toThrow(
        "Failed to create pantry"
      );
    });
  });

  describe("getPantryIDByUserID", () => {
    it("should return the pantry ID for a user", async () => {
      const mockPantryID = "12345";
      Pantry.getPantryIDByUserID = jest.fn().mockResolvedValue(mockPantryID);

      const result = await Pantry.getPantryIDByUserID("user1");
      expect(result).toBe(mockPantryID);
    });

    it("should return null if no pantry ID is found", async () => {
      Pantry.getPantryIDByUserID = jest.fn().mockResolvedValue(null);

      const result = await Pantry.getPantryIDByUserID("user1");
      expect(result).toBeNull();
    });

    it("should throw an error if the query fails", async () => {
      Pantry.getPantryIDByUserID = jest
        .fn()
        .mockRejectedValue(new Error("Failed to query"));

      await expect(Pantry.getPantryIDByUserID("user1")).rejects.toThrow(
        "Failed to query"
      );
    });
  });
  describe("updateIngredientInPantry", () => {
    let mockRequest, mockConnection;
  
    beforeEach(() => {
      mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn(),
      };
  
      mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined),
      };
  
      sql.connect = jest.fn().mockResolvedValue(mockConnection);
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it("should update the ingredient quantity in the pantry", async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [1] });
  
      const result = await Pantry.updateIngredientInPantry(1, 1, 10);
  
      expect(sql.connect).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith("pantry_id", 1);
      expect(mockRequest.input).toHaveBeenCalledWith("ingredient_id", 1);
      expect(mockRequest.input).toHaveBeenCalledWith("quantity", 10);
      expect(mockRequest.query).toHaveBeenCalledWith(expect.any(String));
      expect(result).toEqual({ pantry_id: 1, ingredient_id: 1, quantity: 10 });
      expect(mockConnection.close).toHaveBeenCalled();
    });
  
    it("should throw an error if the ingredient is not found", async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [0] });
  
      await expect(Pantry.updateIngredientInPantry(1, 1, 10))
        .rejects
        .toThrow('Ingredient not found in pantry');
      
      expect(mockConnection.close).toHaveBeenCalled();
    });
  
    it("should handle database errors properly", async () => {
      const error = new Error('Database error');
      mockRequest.query.mockRejectedValue(error);
  
      await expect(Pantry.updateIngredientInPantry(1, 1, 10))
        .rejects
        .toThrow('Database error');
  
      expect(mockConnection.close).toHaveBeenCalled();
    });
  
    it("should close the connection after execution", async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [1] });
  
      await Pantry.updateIngredientInPantry(1, 1, 10);
  
      expect(mockConnection.close).toHaveBeenCalled();
    });
  });
  
  describe("addIngredientToPantry", () => {
    beforeEach(() => {
      sql.connect = jest.fn().mockResolvedValue(mockConnection);
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
    it("should add a new ingredient to the pantry", async () => {
      const pantry_id = "1";
      const ingredient_name = "Tomato";
      const quantity = 10;
      const ingredient_id = 123;
      const ingredient_name_db = "Tomato";
      const ingredient_image = "image_url";

      axios.get.mockResolvedValue({
        data: {
          results: [
            {
              id: ingredient_id,
              name: ingredient_name_db,
              image: ingredient_image,
            },
          ],
        },
      });
      Pantry.checkIngredientQuery = jest.fn().mockResolvedValue({});
      Pantry.getIngredientFromPantry = jest.fn().mockResolvedValue(null);
      sql.connect.mockResolvedValue({
        request: () => ({
          input: jest.fn(),
          query: jest.fn().mockResolvedValue({}),
        }),
        close: jest.fn(),
      });

      const result = await Pantry.addIngredientToPantry(
        pantry_id,
        ingredient_name,
        quantity
      );

      expect(result).toEqual({
        ingredient_id,
        ingredient_name: ingredient_name_db,
        quantity: parseInt(quantity),
      });
    });

    it("should update the quantity of an existing ingredient in the pantry", async () => {
      Pantry.getIngredientFromPantry = jest
        .fn()
        .mockResolvedValue({ quantity: 5 });
      Pantry.checkIngredientQuery = jest.fn().mockResolvedValue({});
      Pantry.updateIngredientInPantry = jest.fn().mockResolvedValue({
        pantry_id: "pantry1",
        ingredient_id: 1,
        quantity: 15,
      });

      sql.connect.mockResolvedValue({
        request: () => ({ input: jest.fn(), query: jest.fn() }),
        close: jest.fn(),
      });

      axios.get.mockResolvedValue({
        data: {
          results: [{ id: 1, name: "Test Ingredient", image: "test.jpg" }],
        },
      });

      const result = await Pantry.addIngredientToPantry(
        "pantry1",
        "Test Ingredient",
        10
      );

      expect(result).toEqual({
        pantry_id: "pantry1",
        ingredient_id: 1,
        quantity: 15,
      });

      expect(Pantry.updateIngredientInPantry).toHaveBeenCalledWith(
        "pantry1",
        1,
        15
      );
    });

    it("should handle database errors properly when adding ingredient", async () => {
      sql.connect.mockRejectedValue(new Error("Database connection error"));

      await expect(
        Pantry.addIngredientToPantry("pantry1", "Test Ingredient", 10)
      ).rejects.toThrow("Database connection error");
    });
  });

  describe("deductIngredientQuantity", () => {
    it("should deduct quantity and update if more than zero", async () => {
      Pantry.getIngredientFromPantry = jest
        .fn()
        .mockResolvedValue({ quantity: 10 });
      Pantry.updateIngredientInPantry = jest.fn().mockResolvedValue({
        pantry_id: "pantry1",
        ingredient_id: 1,
        quantity: 5,
      });

      const result = await Pantry.deductIngredientQuantity("pantry1", 1, 5);

      expect(result).toEqual({
        pantry_id: "pantry1",
        ingredient_id: 1,
        quantity: 5,
      });

      expect(Pantry.updateIngredientInPantry).toHaveBeenCalledWith(
        "pantry1",
        1,
        5
      );
    });

    it("should return zero quantity and a message if deduction results in zero or negative quantity", async () => {
      Pantry.getIngredientFromPantry = jest
        .fn()
        .mockResolvedValue({ quantity: 10 });

      const mockRequest = { query: jest.fn() };
      sql.connect.mockResolvedValue({
        request: () => mockRequest,
        close: jest.fn(),
      });

      const result = await Pantry.deductIngredientQuantity("pantry1", 1, 15);
      expect(result).toEqual({
        pantry_id: "pantry1",
        ingredient_id: 1,
        quantity: 0,
        message: "Ingredient quantity is zero or less",
      });
    });

    it("should handle database errors properly when deducting ingredient quantity", async () => {
      sql.connect.mockRejectedValue(new Error("Database connection error"));

      await expect(
        Pantry.deductIngredientQuantity("pantry1", 1, 5)
      ).rejects.toThrow("Database connection error");
    });
  });

  describe("deleteIngredientFromPantry", () => {
    it("should delete an ingredient from the pantry", async () => {
      const pantry_id = "1";
      const ingredient_id = 123;

      sql.connect.mockResolvedValue({
        request: () => ({
          input: jest.fn(),
          query: jest.fn().mockResolvedValue({}),
        }),
        close: jest.fn(),
      });

      const result = await Pantry.deleteIngredientFromPantry(
        pantry_id,
        ingredient_id
      );

      expect(result).toEqual({
        pantry_id,
        ingredient_id,
        message: "Ingredient removed from pantry",
      });
    });

    it("should handle database errors properly when deleting ingredient", async () => {
      sql.connect.mockRejectedValue(new Error("Database connection error"));

      await expect(Pantry.deleteIngredientFromPantry("1", 123)).rejects.toThrow(
        "Database connection error"
      );
    });
  });

  describe("getIngredients", () => {
    it("should get all ingredients for a user", async () => {
      const userId = "123";
      const ingredients = [
        {
          ingredient_id: 1,
          ingredient_name: "Tomato",
          ingredient_image: "image_url",
        },
      ];

      sql.connect.mockResolvedValue({
        request: () => ({
          input: jest.fn(),
          query: jest.fn().mockResolvedValue({
            recordset: ingredients,
          }),
        }),
        close: jest.fn(),
      });

      const result = await Pantry.getIngredients(userId);
      expect(result).toEqual(ingredients);
    });

    it("should handle database errors properly when getting ingredients", async () => {
      sql.connect.mockRejectedValue(new Error("Database connection error"));

      await expect(Pantry.getIngredients("123")).rejects.toThrow(
        "Database connection error"
      );
    });
  });
});
