const validateRecipe = (req, res, next) => {
    const { title, imageurl, servings, readyInMinutes, pricePerServing } = req.body;
  
    // Validate updates object
    if (typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ message: 'Updates must be an object' });
    }
  
    // Validate specific fields
    if (title && typeof title !== 'string') {
      return res.status(400).json({ message: 'Title must be a string' });
    }
  
    if (imageurl && typeof imageurl !== 'string') {
      return res.status(400).json({ message: 'Image URL must be a string' });
    }
  
    if (servings && !Number.isInteger(servings)) {
      return res.status(400).json({ message: 'Servings must be an integer' });
    }
  
    if (readyInMinutes && !Number.isInteger(readyInMinutes)) {
      return res.status(400).json({ message: 'Ready in minutes must be an integer' });
    }
  
    if (pricePerServing && typeof pricePerServing !== 'number') {
      return res.status(400).json({ message: 'Price per serving must be a number' });
    }
  
    // If all validations pass, move to the next middleware or controller
    next();
  };
  
  module.exports = validateRecipe;
  