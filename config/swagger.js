const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger-output.json";
const routes = ["../app.js", "../routes/api/pantryRoutes.js", "../routes/api/userRoutes.js", "../routes/api/requestRoutes.js", "../routes/api/recipeRoutes.js"];

const doc = {
  info: {
    title: "NutriAID",
    description: "NutriAid is a web application designed to bridge the gap between underprivileged individuals and volunteers willing to provide food aid.",
  },
  host: "localhost:3500",
  schemes: ['http'],
  definitions: {
    User: {
      type: "object",
      properties: {
        username: { type: "string", example: "TestUserWithSQL" },
        password: { type: "string", example: "User123!" },
        firstname: { type: "string", example: "Test" },
        lastname: { type: "string", example: "User" },
        roles: {
          type: "object",
          properties: {
            User: { type: "number", example: 2001 }
          }
        },
        address: { type: "string", example: "123 Main St" },
        email: { type: "string", example: "john.doe.xxx@example.com" },
        contact: { type: "string", example: "12345678" },
        dietaryRestrictions: {
          type: "array",
          items: { type: "string" },
          example: ["Pescetarian", "Paleo"]
        },
        intolerances: {
          type: "array",
          items: { type: "string" },
          example: ["Sesame", "Shellfish"]
        },
        excludedIngredients: {
          type: "array",
          items: { type: "string" },
          example: ["fish", "chicken", "beef"]
        },
        dateOfBirth: { type: "string", example: "2024-06-06" }
      }
    }
  }, Ingredient: {
    type: 'object',
    properties: {
      ingredient_id: {
        type: 'string',
        example: '10115261'
      },
      ingredient_name: {
        type: 'string',
        example: 'fish fillets'
      }
    }
  },
  RecipeIngredient: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        example: 'apples'
      },
      amount: {
        type: 'number',
        format: 'float',
        example: 2
      },
      unit: {
        type: 'string',
        example: 'g'
      }
    }
  },
  Recipe: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: '912331'
      },
      title: {
        type: 'string',
        example: 'TestRecipePost'
      },
      imageurl: {
        type: 'string',
        example: 'https://img.spoonacular.com/recipes/639851-556x370.jpg'
      },
      servings: {
        type: 'integer',
        format: 'int32',
        example: 2
      },
      readyInMinutes: {
        type: 'integer',
        format: 'int32',
        example: 6
      },
      pricePerServing: {
        type: 'number',
        format: 'float',
        example: 500
      }
    }
  }
};

