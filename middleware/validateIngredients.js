const Joi = require('joi');

// Schema for a single ingredient
const ingredientSchema = Joi.object({
  ingredient_id: Joi.string().required(),
  ingredient_name: Joi.string().optional(),
  ingredient_image: Joi.string().optional()
});

// Schema for an array of ingredients
const ingredientsArraySchema = Joi.array().items(ingredientSchema);

const validateIngredients = (req, res, next) => {
  const { body } = req;

  // Check if body is an array
  const { error } = Array.isArray(body)
    ? ingredientsArraySchema.validate(body)
    : ingredientSchema.validate(body);

  if (error) {
    return res.status(400).json({ message: error.details.map(detail => detail.message).join(', ') });
  }

  next();
};

module.exports = validateIngredients;
