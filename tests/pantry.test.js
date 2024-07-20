const sql = require("mssql");
const axios = require("axios");
const Pantry = require("../models/pantry"); // Adjust the path to your model

jest.mock("mssql");
jest.mock("axios");

describe("Pantry Class", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    // Fix this test
    describe("createPantry", () => {
        it("should create a new pantry if none exists for the user", async () => {
            const user_id = "123";
            const pantry_id = "ABCDE";

            Pantry.getPantryIDByUserID = jest.fn().mockResolvedValue(null);
            Pantry.generate5CharacterGene = jest.fn().mockReturnValue(pantry_id);
            sql.connect = jest.fn().mockResolvedValue({
                request: () => ({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValue({})
                }),
                close: jest.fn()
            });

            const result = await Pantry.createPantry(user_id);

            expect(result).toBe(pantry_id);
            expect(Pantry.generate5CharacterGene).toHaveBeenCalled();
        });

        it("should return existing pantry ID if one already exists for the user", async () => {
            const user_id = "123";
            const pantry_id = "ABCDE";

            Pantry.getPantryIDByUserID = jest.fn().mockResolvedValue(pantry_id);

            const result = await Pantry.createPantry(user_id);

            expect(result).toBe(pantry_id);
            expect(Pantry.getPantryIDByUserID).toHaveBeenCalledWith(user_id);
            expect(sql.connect).not.toHaveBeenCalled();
        });
    });
    // Fix this test (both)
    describe("getPantryIDByUserID", () => {
        it("should return the pantry ID for a user", async () => {
            const user_id = "123";
            const pantry_id = "ABCDE";

            sql.connect = jest.fn().mockResolvedValue({
                request: () => ({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValue({
                        recordset: [{ pantry_id }]
                    })
                }),
                close: jest.fn()
            });

            const result = await Pantry.getPantryIDByUserID(user_id);

            expect(result).toBe(pantry_id);
        });

        it("should return null if no pantry ID is found", async () => {
            const user_id = "123";

            sql.connect = jest.fn().mockResolvedValue({
                request: () => ({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValue({
                        recordset: []
                    })
                }),
                close: jest.fn()
            });

            const result = await Pantry.getPantryIDByUserID(user_id);

            expect(result).toBe(null);
        });
    });

    describe("addIngredientToPantry", () => {
        it("should add a new ingredient to the pantry", async () => {
            const pantry_id = "1";
            const ingredient_name = "Tomato";
            const quantity = 10;
            const ingredient_id = 123;
            const ingredient_name_db = "Tomato";
            const ingredient_image = "image_url";

            axios.get = jest.fn().mockResolvedValue({
                data: {
                    results: [{ id: ingredient_id, name: ingredient_name_db, image: ingredient_image }]
                }
            });
            Pantry.checkIngredientQuery = jest.fn().mockResolvedValue({});
            Pantry.getIngredientFromPantry = jest.fn().mockResolvedValue(null);
            sql.connect = jest.fn().mockResolvedValue({
                request: () => ({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValue({})
                }),
                close: jest.fn()
            });

            const result = await Pantry.addIngredientToPantry(pantry_id, ingredient_name, quantity);

            expect(result).toEqual({
                ingredient_id,
                ingredient_name: ingredient_name_db,
                quantity
            });
        });
        // Fix this test
        it("should update the quantity of an existing ingredient in the pantry", async () => {
            const pantry_id = "1";
            const ingredient_name = "Tomato";
            const quantity = 10;
            const ingredient_id = 123;
            const existingQuantity = 5;

            axios.get = jest.fn().mockResolvedValue({
                data: {
                    results: [{ id: ingredient_id, name: "Tomato", image: "image_url" }]
                }
            });
            Pantry.checkIngredientQuery = jest.fn().mockResolvedValue({});
            Pantry.getIngredientFromPantry = jest.fn().mockResolvedValue({ quantity: existingQuantity });
            Pantry.updateIngredientInPantry = jest.fn().mockResolvedValue({});

            const result = await Pantry.addIngredientToPantry(pantry_id, ingredient_name, quantity);

            expect(result).toEqual({
                ingredient_id,
                ingredient_name: "Tomato",
                quantity: existingQuantity + quantity
            });
        });
    });

    describe("updateIngredientInPantry", () => {
        it("should update an ingredient's quantity in the pantry", async () => {
            const pantry_id = "1";
            const ingredient_id = 123;
            const quantity = 15;

            sql.connect = jest.fn().mockResolvedValue({
                request: () => ({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
                }),
                close: jest.fn()
            });

            const result = await Pantry.updateIngredientInPantry(pantry_id, ingredient_id, quantity);

            expect(result).toEqual({
                pantry_id,
                ingredient_id,
                quantity
            });
        });

        it("should throw an error if the ingredient is not found in the pantry", async () => {
            const pantry_id = "1";
            const ingredient_id = 123;
            const quantity = 15;

            sql.connect = jest.fn().mockResolvedValue({
                request: () => ({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValue({ rowsAffected: [0] })
                }),
                close: jest.fn()
            });

            await expect(Pantry.updateIngredientInPantry(pantry_id, ingredient_id, quantity)).rejects.toThrow("Ingredient not found in pantry");
        });
    });

    describe("deductIngredientQuantity", () => {
        it("should deduct quantity and update if more than zero", async () => {
            const pantry_id = "1";
            const ingredient_id = 123;
            const quantity = 5;

            Pantry.getIngredientFromPantry = jest.fn().mockResolvedValue({ quantity: 10 });
            Pantry.updateIngredientInPantry = jest.fn().mockResolvedValue({});

            const result = await Pantry.deductIngredientQuantity(pantry_id, ingredient_id, quantity);

            expect(result).toEqual({
                pantry_id,
                ingredient_id,
                quantity: 10 - quantity
            });
        });
            // Fix this test
        it("should return zero quantity and a message if deduction results in zero or negative quantity", async () => {
            const pantry_id = "1";
            const ingredient_id = 123;
            const quantity = 15;
            const currentQuantity = 10;

            Pantry.getIngredientFromPantry = jest.fn().mockResolvedValue({ quantity: currentQuantity });

            const result = await Pantry.deductIngredientQuantity(pantry_id, ingredient_id, quantity);

            expect(result).toEqual({
                pantry_id,
                ingredient_id,
                quantity: 0,
                message: "Ingredient quantity is zero or less"
            });
        });
    });
    
    describe("deleteIngredientFromPantry", () => {
        it("should delete an ingredient from the pantry", async () => {
            const pantry_id = "1";
            const ingredient_id = 123;

            sql.connect = jest.fn().mockResolvedValue({
                request: () => ({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValue({})
                }),
                close: jest.fn()
            });

            const result = await Pantry.deleteIngredientFromPantry(pantry_id, ingredient_id);

            expect(result).toEqual({
                pantry_id,
                ingredient_id,
                message: "Ingredient removed from pantry"
            });
        });
    });

    describe("getIngredients", () => {
        it("should get all ingredients for a user", async () => {
            const userId = "123";
            const ingredients = [
                { ingredient_id: 1, ingredient_name: "Tomato", ingredient_image: "image_url" }
            ];

            sql.connect = jest.fn().mockResolvedValue({
                request: () => ({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValue({ recordset: ingredients })
                }),
                close: jest.fn()
            });

            const result = await Pantry.getIngredients(userId);

            expect(result).toEqual(ingredients);
        });
    });
});
