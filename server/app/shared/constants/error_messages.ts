import { StatusCodes } from "http-status-codes";

import { ErrorInterface } from "../../interfaces";

export const permissionDenied = (meta?: { [property: string]: string }): ErrorInterface => ({
  message: "Permission denied",
  httpStatus: StatusCodes.FORBIDDEN,
});

export const USER_EXIST: ErrorInterface = {
  message: "User exist",
  httpStatus: StatusCodes.CONFLICT,
};

export const USER_NICKNAME_EXISTS: ErrorInterface = {
  message: "This nickname is already taken",
  httpStatus: StatusCodes.CONFLICT,
};

export const USER_CODE_NOT_VALID: ErrorInterface = {
  message: "Wrong combination of numbers",
  httpStatus: StatusCodes.NOT_FOUND,
};

export const USER_HASH_NOT_VALID: ErrorInterface = {
  message: "User hash is invalid or has expired",
  httpStatus: StatusCodes.NOT_FOUND,
};

export const USER_CODE_HAS_EXPIRED: ErrorInterface = {
  message: "The activation code has expired",
  httpStatus: StatusCodes.GONE,
};

export const BAD_LOGIN: ErrorInterface = {
  message: "Login or password are incorrect",
  httpStatus: StatusCodes.UNAUTHORIZED,
};

export const INACTIVE_USER: ErrorInterface = {
  message: "User is not activated",
  httpStatus: StatusCodes.UNAUTHORIZED,
};

export const USER_NOT_FOUND: ErrorInterface = {
  message: "User doesn't exist",
  httpStatus: StatusCodes.NOT_FOUND,
};

export const DISH_EXISTS: ErrorInterface = {
  message: "Such dish is currently unavailable. Please try another dish.",
  httpStatus: StatusCodes.CONFLICT,
};

export const customError = (httpStatus: number, message: string) => {
  return { httpStatus, message };
};

export const notFoundError = (type: string, meta?: { [property: string]: string }): ErrorInterface => {
  return {
    httpStatus: StatusCodes.NOT_FOUND,
    message: `${type} not found`,
  };
};

export const expiredError = (type: string): ErrorInterface => {
  return {
    httpStatus: StatusCodes.NOT_FOUND,
    message: `${type} is not valid or had expired`,
  };
};

export const customUnprocessableError = (message: string, meta?: { [property: string]: string }): ErrorInterface => {
  return {
    message,
    httpStatus: StatusCodes.UNPROCESSABLE_ENTITY,
  };
};

export const customRateLimitError = (type: string): ErrorInterface => {
  return {
    message: `Too many ${type} requests`,
    httpStatus: StatusCodes.TOO_MANY_REQUESTS,
  };
};
