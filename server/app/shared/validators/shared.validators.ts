import { Joi } from "koa-joi-router";

export const idOptional = Joi.number().integer().positive();

export const idRequired = idOptional.required();
export const numberRequired = Joi.number().required();
export const stringRequired = Joi.string().required();

export const errorValidators = Joi.object({
  code: Joi.number().required(),
  message: Joi.number().required(),
});

export const emptyStringRequired = Joi.string().allow("").required();

export const allowEmptyNullableString = Joi.string().allow("").allow(null).optional();

export const statusResponseValidator = Joi.object({
  status: Joi.string().required(),
});
