import * as Koa from "koa";
import * as HttpStatus from "http-status-codes";

import { ErrorInterface } from "../interfaces";

const handleJoiErrors = (details: ErrorInterface[]): ErrorInterface => {
  if (!details.length) {
    return {
      httpStatus: HttpStatus.BAD_REQUEST,
      message: "Bad Request",
    };
  }

  return {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: details.map((detail) => detail.message).join(),
  };
};

export default async (ctx: Koa.Context, next: () => Promise<Koa.Next>) => {
  try {
    await next();
  } catch (e) {
    ctx.status = e.httpStatus || e.status || HttpStatus.INTERNAL_SERVER_ERROR;
    e.status = ctx.status;

    if (e.isJoi) {
      const { httpStatus, message } = handleJoiErrors(e.details);
      ctx.httpStatus = httpStatus;
      e.status = e.statusCode;
      e.message = message;
    }

    ctx.body = {
      code: ctx.status,
      message: e.message,
    };
    ctx.app.emit("error", e, ctx);
  }
};
