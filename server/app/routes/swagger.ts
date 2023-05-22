import { ParameterizedContext } from "koa";
//@ts-ignore
import { SwaggerAPI } from "koa-joi-router-docs-v2";

const generator = new SwaggerAPI();

[].forEach((route) => {
  generator.addJoiRouter(route());
});

const spec = generator.generateSpec(
  {
    info: {
      title: "API",
      description: "API for backend.",
      version: process.env.npm_package_version,
    },
    basePath: "/api/v1/",
    tags: [],
  },
  {},
);

export const swagger = async (ctx: ParameterizedContext) => {
  ctx.body = JSON.stringify(spec, null, "  ");
};
