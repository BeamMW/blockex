import { ParameterizedContext } from "koa";

import { redisStore } from "../db/redis";
import { Block } from "../models/blocks";
import { Contract, Call } from "../models/contracts";

const Joi = require("joi");

export const getAliveHandler = async (ctx: ParameterizedContext) => {
  const uptime_minutes = process.uptime() / 60;
  const current_date = new Date().toISOString();
  const start_date = new Date(Date.now() - process.uptime() * 1000).toISOString();
  ctx.ok({
    uptime_minutes,
    current_date,
    start_date,
  });
};

export const getStatus = async (ctx: ParameterizedContext) => {
  const status = await redisStore.get("status");

  ctx.ok({
    status: "success",
    data: JSON.parse(status),
  });
};

export const getAssets = async (ctx: ParameterizedContext) => {
  // const status = await redisStore.get("status");

  ctx.ok({
    status: "success",
    data: [], //JSON.parse(status),
  });
};

export const getDappsList = async (ctx: ParameterizedContext) => {
  // const status = await redisStore.get("status");

  ctx.ok({
    status: "success",
    data: [], //JSON.parse(status),
  });
};

export const getContracts = async (ctx: ParameterizedContext) => {
  const contracts: any = await Contract.find();
  ctx.ok({
    status: "success",
    data: contracts,
  });
};

export const getContract = async (ctx: ParameterizedContext) => {
  const contractQuerySchema = Joi.object({
    id: Joi.string().required(),
    per_page: Joi.number().integer().min(10).default(20),
    page: Joi.number().integer().min(0).default(0),
  });

  const { error, value } = contractQuerySchema.validate(ctx.request.query, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details.map((detail: any) => detail.message) };
  } else {
    const { id, per_page, page } = ctx.request.query;

    const calls = await Call.aggregate([
      { $match: { cid: id } },
      { $sort: { height: -1 } },
      { $skip: Number(per_page) * Number(page) },
      { $limit: Number(per_page) },
    ]);
    const count = await Call.countDocuments({ cid: id }); //TODO: separate in task and store in contract doc
    const contract = await Contract.aggregate([
      { $match: { cid: id } },
      {
        $addFields: {
          calls,
          page,
          count,
          pages: Math.ceil(count / Number(per_page)),
        },
      },
    ]);
    ctx.ok({
      status: "success",
      data: contract,
    });
  }
};

export const getBlocks = async (ctx: ParameterizedContext) => {
  const contractQuerySchema = Joi.object({
    per_page: Joi.number().integer().min(10).default(20),
    page: Joi.number().integer().min(0).default(0),
  });

  const { error, value } = contractQuerySchema.validate(ctx.request.query, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details.map((detail: any) => detail.message) };
  } else {
    const { per_page, page } = ctx.request.query;
    //TODO: add calls count by height (lookup?)
    const blocks = await Block.aggregate([
      { $sort: { height: -1 } },
      { $skip: Number(per_page) * Number(page) },
      { $limit: Number(per_page) },
      {
        $addFields: {
          inputsCount: {
            $size: "$inputs",
          },
          outputsCount: {
            $size: "$outputs",
          },
          kernelsCount: {
            $size: "$kernels",
          },
          fee: {
            $sum: "$kernels.fee",
          },
        },
      },
      {
        $unset: [
          "inputs",
          "outputs",
          "kernels",
          "_id",
          "subsidy",
          "rate_btc",
          "rate_usd",
          "prev",
          "found",
          "chainwork",
        ],
      },
    ]);
    const count = await Block.estimatedDocumentCount();
    ctx.ok({
      status: "success",
      data: {
        blocks,
        page: page,
        pages: Math.ceil(count / Number(per_page)),
        count,
      },
    });
  }
};
