import Joi from "joi";

export const tourBookingSchema = Joi.object({
  contactName: Joi.string().required(),
  contactEmail: Joi.string().email().required(),
  contactPhone: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .required(),
  numberOfTravellers: Joi.number().min(1).required(),
  totalAmount: Joi.number().min(0).required(),
  travellers: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
        }).unknown(true)
      )
    )
    .required(),
});

export const visaBookingSchema = Joi.object({
  visaType: Joi.string().valid("10_DAYS", "30_DAYS").required(),
  contactName: Joi.string().required(),
  contactEmail: Joi.string().email().required(),
  contactPhone: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .required(),
  numberOfTravellers: Joi.number().min(1).required(),
  totalAmount: Joi.number().min(0).required(),
  travellers: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
        }).unknown(true)
      )
    )
    .required(),
});
