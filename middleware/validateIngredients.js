const validateIngredients = (req, res, next) => {
  const ingredients = req.body;

  // Check if ingredients is an array and not empty
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ message: 'Ingredients must be provided and should be an array' });
  }

  for (const ingredient of ingredients) {
    // Check for required fields
    if (
      !ingredient.ingredient_id ||
      typeof ingredient.ingredient_id !== 'string' ||
      !ingredient.ingredient_name ||
      typeof ingredient.ingredient_name !== 'string'
    ) {
      return res.status(400).json({ message: 'Each ingredient must have valid ingredient_id and ingredient_name' });
    }

    // Optional field check
    if (ingredient.ingredient_image && typeof ingredient.ingredient_image !== 'string') {
      return res.status(400).json({ message: 'If provided, ingredient_image must be a string' });
    }
  }

  // Proceed to the next middleware or route handler
  next();
};

module.exports = validateIngredients;
