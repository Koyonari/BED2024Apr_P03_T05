const Joi = require("joi");

const validateUser = (req, res, next) => {
  // Reg Expression for Password
  const passwordPattern = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$"
  );

  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    // Validate password with regex pattern
    password: Joi.string().pattern(passwordPattern)
      .messages({
        "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      })
      .required(),
    firstname: Joi.string().allow("", null).max(50),
    lastname: Joi.string().allow("", null).max(50),
    // Validate roles using joi.object, as roles is an object with keys User, Volunteer, and Admin
    roles: Joi.object({
      User: Joi.number().valid(2001),
      Volunteer: Joi.number().valid(2002),
    }).unknown(false).required(), // Unknown(false) because only have these 3 roles, no additional keys allowed
    refreshToken: Joi.string().allow("", null),
    address: Joi.string().allow("", null),
    dietaryRestrictions: Joi.array().items(Joi.string()),
    intolerances: Joi.array().items(Joi.string()),
    excludedIngredients: Joi.array().items(Joi.string()),
    email: Joi.string().email().required(),
    contact: Joi.string().required(),
    dateOfBirth: Joi.date().allow("", null),
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
