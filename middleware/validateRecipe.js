const Joi = require('joi');

// Define Joi schema for recipe validation
const validateRecipeSchema = Joi.object({
  title: Joi.string().optional(),
  imageurl: Joi.string().uri().optional(),
  servings: Joi.number().integer().optional(),
  readyInMinutes: Joi.number().integer().optional(),
  pricePerServing: Joi.number().optional()
}).options({ abortEarly: false });

// Middleware to validate recipe data
const validateRecipe = (req, res, next) => {
  // Validate req.body against the schema
  const { error } = validateRecipeSchema.validate(req.body);

  if (error) {
    // Extract error details from Joi validation error
    const errorDetails = error.details.map(detail => detail.message);
    return res.status(400).json({ message: 'Validation errors', errors: errorDetails });
  }
  // Proceed to the next middleware or route handler
  next();
};

module.exports = validateRecipe;
