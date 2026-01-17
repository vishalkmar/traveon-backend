import Joi from "joi";

export const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be valid (10-15 digits)",
    }),
  subject: Joi.string().min(3).max(200).required(),
  message: Joi.string().min(10).max(2000).required(),
});
