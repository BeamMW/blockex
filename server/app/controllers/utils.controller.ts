import { ParameterizedContext } from "koa";

import { redisStore } from "../db/redis";
import { Blocks, Contract, Call, Assets } from "../models";

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

export const getDappsList = async (ctx: ParameterizedContext) => {
  // const status = await redisStore.get("status");

  ctx.ok({
    status: "success",
    data: [], //JSON.parse(status),
  });
};

export const getContracts = async (ctx: ParameterizedContext) => {
  const contractsQuerySchema = Joi.object({
    per_page: Joi.number().integer().min(10).default(20),
    page: Joi.number().integer().min(0).default(0),
  });

  const { error, value } = contractsQuerySchema.validate(ctx.request.query, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details.map((detail: any) => detail.message) };
  } else {
    const { per_page, page } = ctx.request.query;
    //TODO: add calls count by height (lookup?)
    const contracts = await Contract.aggregate([
      { $sort: { kind: -1, calls_count: -1 } },
      { $skip: Number(per_page) * Number(page) },
      { $limit: Number(per_page) },
    ]);
    const count = await Contract.estimatedDocumentCount();
    ctx.ok({
      status: "success",
      data: {
        contracts,
        page: Number(page),
        pages: Math.ceil(count / Number(per_page)),
        count,
      },
    });
  }
};

export const getAllAssets = async (ctx: ParameterizedContext) => {
  const assets = await Assets.find({});
  ctx.ok({
    status: "success",
    data: {
      assets,
    },
  });
};

export const getAssets = async (ctx: ParameterizedContext) => {
  const assetsQuerySchema = Joi.object({
    per_page: Joi.number().integer().min(10).default(20),
    page: Joi.number().integer().min(0).default(0),
  });

  const { error, value } = assetsQuerySchema.validate(ctx.request.query, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details.map((detail: any) => detail.message) };
  } else {
    const { per_page, page } = ctx.request.query;
    let assets;
    assets = await Assets.aggregate([
      { $sort: { lock_height: -1 } },
      { $skip: Number(per_page) * Number(page) },
      { $limit: Number(per_page) },
    ]);
    const count = await Assets.estimatedDocumentCount();
    ctx.ok({
      status: "success",
      data: {
        assets,
        page: Number(page),
        pages: Math.ceil(count / Number(per_page)),
        count,
      },
    });
  }
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
      { $unset: ["_id", "_contract"] },
    ]);
    const contract = await Contract.aggregate([
      { $match: { cid: id } },
      {
        $addFields: {
          calls,
          page,
        },
      },
      {
        $unset: ["_id", "cid"],
      },
    ]);
    ctx.ok({
      status: "success",
      data: contract[0],
    });
  }
};

export const getBlocks = async (ctx: ParameterizedContext) => {
  const blocksQuerySchema = Joi.object({
    per_page: Joi.number().integer().min(10).default(20),
    page: Joi.number().integer().min(0).default(0),
  });

  const { error, value } = blocksQuerySchema.validate(ctx.request.query, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details.map((detail: any) => detail.message) };
  } else {
    const { per_page, page } = ctx.request.query;
    //TODO: add calls count by height (lookup?)
    const blocks = await Blocks.aggregate([
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
    const count = await Blocks.estimatedDocumentCount();
    ctx.ok({
      status: "success",
      data: {
        blocks,
        page: Number(page),
        pages: Math.ceil(count / Number(per_page)),
        count,
      },
    });
  }
};
