const Pantry = require("../models/pantry");
const db = require("../middleware/db");
const {
  getPantryIngredients,
  createPantry,
  getPantryIDByUserID,
  addIngredientToPantry,
  getIngredientsByPantryID,
  updateIngredientInPantry,
  deductIngredientQuantity,
  addIngredientQuantity,
  deleteIngredientFromPantry,
} = require("../controllers/pantryController");

// Mock the required modules
jest.mock("../models/pantry");

// Mock the required functions
jest.mock("../controllers/pantryController", () => ({
  ...jest.requireActual("../controllers/pantryController"),
}));
jest.mock("../middleware/db", () => {
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
    sql: jest.requireActual("mssql"), // Use actual mssql library for `sql` part
    poolPromise, // Export the mocked poolPromise
  };
});

describe("Pantry Controller", () => {
  // Helper function to create mock request and response objects
  const createMocks = () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    return { req, res };
  };

  // Test for getPantryIngredients
  describe("getPantryIngredients", () => {
    it("should return pantry ingredients for a user", async () => {
      const { req, res } = createMocks();
      req.userid = "123";
      Pantry.getIngredients.mockResolvedValue([
        { name: "Tomato", quantity: 10 },
      ]);

      await getPantryIngredients(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ name: "Tomato", quantity: 10 }]);
    });

    it("should return 401 if user ID is not available", async () => {
      const { req, res } = createMocks();
      Pantry.getIngredients.mockResolvedValue([]);

      await getPantryIngredients(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthorized: User information not available",
      });
    });

    it("should handle errors gracefully", async () => {
      const { req, res } = createMocks();
      req.userid = "123";
      const error = new Error("Database error");
      Pantry.getIngredients.mockRejectedValue(error);

      await getPantryIngredients(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching pantry ingredients",
        error: "Database error",
      });
    });
  });

  // Test for createPantry
  describe("createPantry", () => {
    it("should create a new pantry for a user", async () => {
      const { req, res } = createMocks();
      req.params = { user_id: "123" };
      Pantry.getPantryIDByUserID.mockResolvedValue(null);
      Pantry.createPantry.mockResolvedValue("new-pantry-id");

      await createPantry(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Pantry has been created for user",
        pantry_id: "new-pantry-id",
      });
    });

    it("should return a message if the user already has a pantry", async () => {
      const { req, res } = createMocks();
      req.params = { user_id: "123" };
      Pantry.getPantryIDByUserID.mockResolvedValue("existing-pantry-id");

      await createPantry(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User already has a pantry",
        pantry_id: "existing-pantry-id",
      });
    });

    it("should handle errors gracefully", async () => {
      const { req, res } = createMocks();
      req.params = { user_id: "123" };
      Pantry.getPantryIDByUserID.mockRejectedValue(new Error("Database error"));

      await createPantry(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  // Test for getPantryIDByUserID
  describe("getPantryIDByUserID", () => {
    it("should return the pantry ID for a user", async () => {
      const { req, res } = createMocks();
      req.params = { user_id: "123" };
      Pantry.getPantryIDByUserID.mockResolvedValue("pantry-id");

      await getPantryIDByUserID(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ pantry_id: "pantry-id" });
    });

    it("should return 404 if no pantry is found for the user", async () => {
      const { req, res } = createMocks();
      req.params = { user_id: "123" };
      Pantry.getPantryIDByUserID.mockResolvedValue(null);

      await getPantryIDByUserID(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No pantry found for the user",
      });
    });

    it("should handle errors gracefully", async () => {
      const { req, res } = createMocks();
      req.params = { user_id: "123" };
      const error = new Error("Database error");
      Pantry.getPantryIDByUserID.mockRejectedValue(error);

      await getPantryIDByUserID(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  // Test for addIngredientToPantry
  describe("addIngredientToPantry", () => {
    it("should add an ingredient to a pantry", async () => {
      const { req, res } = createMocks();
      req.params = { pantry_id: "1" };
      req.body = { ingredient_name: "Tomato", quantity: 10 };
      Pantry.addIngredientToPantry.mockResolvedValue({ success: true });

      await addIngredientToPantry(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Ingredient added to pantry",
        result: { success: true },
      });
    });

    it("should handle errors gracefully", async () => {
      const { req, res } = createMocks();
      req.params = { pantry_id: "1" };
      req.body = { ingredient_name: "Tomato", quantity: 10 };
      const error = new Error("Database error");
      Pantry.addIngredientToPantry.mockRejectedValue(error);

      await addIngredientToPantry(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  // Test for getIngredientsByPantryID
  describe("getIngredientsByPantryID", () => {
    it("should return all ingredients in a pantry", async () => {
      const { req, res } = createMocks();
      req.params = { pantry_id: "1" };
      Pantry.getIngredientsByPantryID.mockResolvedValue([
        { name: "Tomato", quantity: 10 },
      ]);

      await getIngredientsByPantryID(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ name: "Tomato", quantity: 10 }]);
    });

    it("should return 404 if no ingredients are found", async () => {
      const { req, res } = createMocks();
      req.params = { pantry_id: "1" };
      Pantry.getIngredientsByPantryID.mockResolvedValue([]);

      await getIngredientsByPantryID(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No ingredients found in pantry",
      });
    });

    it("should handle errors gracefully", async () => {
      const { req, res } = createMocks();
      req.params = { pantry_id: "1" };
      const error = new Error("Database error");
      Pantry.getIngredientsByPantryID.mockRejectedValue(error);

      await getIngredientsByPantryID(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  // Test for addIngredientQuantity
  describe("addIngredientQuantity", () => {
    it("should update ingredient quantity in pantry", async () => {
      const { req, res } = createMocks();
      req.params = { pantry_id: "1" };
      req.body = { ingredient_id: "123", quantity: 5 };
      Pantry.addIngredientQuantity.mockResolvedValue({ success: true });

      await addIngredientQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Ingredient quantity updated in pantry",
        result: { success: true },
      });
    });

    it("should handle errors gracefully", async () => {
      const { req, res } = createMocks();
      req.params = { pantry_id: "1" };
      req.body = { ingredient_id: "123", quantity: 5 };
      const error = new Error("Database error");
      Pantry.addIngredientQuantity.mockRejectedValue(error);

      await addIngredientQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  // Test for deductIngredientQuantity
  describe("deductIngredientQuantity", () => {
    it("should deduct ingredient quantity and remove if zero", async () => {
      const { req, res } = createMocks();
      req.params = { pantry_id: "1" };
      req.body = { ingredient_id: "123", quantity: 5 };
      Pantry.deductIngredientQuantity.mockResolvedValue({ quantity: 0 });
      Pantry.deleteIngredientFromPantry.mockResolvedValue({ success: true });

      await deductIngredientQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Ingredient removed from pantry",
      });
    });

    it("should deduct ingredient quantity without removal if not zero", async () => {
      const { req, res } = createMocks();
      req.params = { pantry_id: "1" };
      req.body = { ingredient_id: "123", quantity: 5 };
      Pantry.deductIngredientQuantity.mockResolvedValue({ quantity: 5 });

      await deductIngredientQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Ingredient quantity updated in pantry",
        result: { quantity: 5 },
      });
    });

    it("should handle errors gracefully", async () => {
      const { req, res } = createMocks();
      req.params = { pantry_id: "1" };
      req.body = { ingredient_id: "123", quantity: 5 };
      const error = new Error("Database error");
      Pantry.deductIngredientQuantity.mockRejectedValue(error);

      await deductIngredientQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  // Test for updateIngredientInPantry
  describe("updateIngredientInPantry", () => {
    it("should update an ingredient in a pantry", async () => {
      const { req, res } = createMocks();
      req.params = { pantry_id: "1" };
      req.body = { ingredient_id: "123", quantity: 15 };
      Pantry.updateIngredientInPantry.mockResolvedValue({ success: true });

      await updateIngredientInPantry(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Ingredient updated in pantry",
        result: { success: true },
      });
    });

    it("should handle errors gracefully", async () => {
      const { req, res } = createMocks();
      req.params = { pantry_id: "1" };
      req.body = { ingredient_id: "123", quantity: 15 };
      const error = new Error("Database error");
      Pantry.updateIngredientInPantry.mockRejectedValue(error);

      await updateIngredientInPantry(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  // Test for deleteIngredientFromPantry
  describe("deleteIngredientFromPantry", () => {
    it("should delete an ingredient from a pantry", async () => {
      const { req, res } = createMocks();
      req.params = { pantry_id: "1" };
      req.body = { ingredient_id: "123" };
      Pantry.deleteIngredientFromPantry.mockResolvedValue({ success: true });

      await deleteIngredientFromPantry(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Ingredient removed from pantry",
        result: { success: true },
      });
    });

    it("should handle errors gracefully", async () => {
      const { req, res } = createMocks();
      req.params = { pantry_id: "1" };
      req.body = { ingredient_id: "123" };
      const error = new Error("Database error");
      Pantry.deleteIngredientFromPantry.mockRejectedValue(error);

      await deleteIngredientFromPantry(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });
});
