const Joi = require("joi");

const validateUser = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).required(),
    firstname: Joi.string().allow('', null).max(50),
    lastname: Joi.string().allow('', null).max(50),
    roles: Joi.object({
        User: Joi.number().required()
      }).default({ User: 2001 }),
    refreshToken: Joi.string().allow('', null),
    address: Joi.string().allow('', null),
    dietaryRestrictions: Joi.array().items(Joi.string()),
    intolerances: Joi.array().items(Joi.string()),
    excludedIngredients: Joi.array().items(Joi.string()),
    email: Joi.string().email().required(),
    contact: Joi.string().required()
  });

  const validation = schema.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((error) => error.message);
    return res.status(400).json({ message: "Validation error", errors });
  }

  req.validatedUser = validation.value; // Attach validated user data to request object
  next(); // Proceed to the next middleware or route handler
};

module.exports = validateUser;
