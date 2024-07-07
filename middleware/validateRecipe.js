const Joi = require('joi');

const validateRecipeSchema = Joi.object({
  title: Joi.string().optional(),
  imageurl: Joi.string().uri().optional(),
  servings: Joi.number().integer().optional(),
  readyInMinutes: Joi.number().integer().optional(),
  pricePerServing: Joi.number().optional()
}).options({ abortEarly: false });

const validateRecipe = (req, res, next) => {
  const { error } = validateRecipeSchema.validate(req.body);

  if (error) {
    const errorDetails = error.details.map(detail => detail.message);
    return res.status(400).json({ message: 'Validation errors', errors: errorDetails });
  }

  next();
};

module.exports = validateRecipe;
