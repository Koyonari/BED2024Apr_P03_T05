const Joi = require("joi");

const validateRequest = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(70).required(),
    category: Joi.string().max(50).required(),
    description: Joi.string().min(0).max(150).required(),
    user_id: Joi.number().integer().min(1).required(),
    volunteer_id: Joi.number().integer().allow(null),
    isCompleted: Joi.boolean().required(),
    admin_id: Joi.number().integer().allow(null)
  });

  const validation = schema.validate(req.body, { abortEarly: false }); // Validate request body

  if (validation.error) {
    const errors = validation.error.details.map((error) => error.message);
    res.status(400).json({ message: "Validation error", errors });
    return; // Terminate middleware execution on validation error
  }

  next(); // If validation passes, proceed to the next route handler
};

const validatePatchAcceptedRequest = (req, res, next) => {
  const schema = Joi.object({
    volunteer_id: Joi.number().integer().allow(null)
  });

  const validation = schema.validate(req.body, { abortEarly: false }); // Validate request body

  if (validation.error) {
    const errors = validation.error.details.map((error) => error.message);
    res.status(400).json({ message: "Validation error", errors });
    return; // Terminate middleware execution on validation error
  }

  next(); // If validation passes, proceed to the next route handler
};

const validatePatchApproveRequest = (req, res, next) => {
  const schema = Joi.object({
    admin_id: Joi.number().integer().allow(null)
  });

  const validation = schema.validate(req.body, { abortEarly: false }); // Validate request body

  if (validation.error) {
    const errors = validation.error.details.map((error) => error.message);
    res.status(400).json({ message: "Validation error", errors });
    return; // Terminate middleware execution on validation error
  }

  next(); // If validation passes, proceed to the next route handler
};

module.exports = {
  validateRequest,
  validatePatchAcceptedRequest,
  validatePatchApproveRequest
};