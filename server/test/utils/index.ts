import * as Koa from "koa";
import * as request from "supertest";

import factory from "../utils/factory";
import knex from "../../app/shared/utils/knex";
import { LoginDto } from "../../app/shared/dto";
import { Role, User } from "../../app/models";
import { app } from "../../app/app";

let req: request.SuperTest<request.Test>;

export const createUser = async (roleName: string = "Super Admin", userPaylaod?: Partial<User>): Promise<User> => {
  const [user, role] = await Promise.all([
    factory.create("User", userPaylaod),
    Role.query().where({ name: roleName }).first(),
  ]);

  await factory.create("UserRole", {
    role_id: role.id,
    user_id: user.id,
  });

  return user;
};

export const getAuthorizationToken = async (app: Koa, payload: LoginDto): Promise<string> => {
  const { body } = await request(app.callback())
    .post("/api/v1/auth/login")
    .set("Accept", "application/json")
    .set("origin", "localhost")
    .send(payload);

  return `Bearer ${body.token}`;
};

export const getAuthorizationInfo = async (
  app: Koa,
  roleName: string = "Super Admin",
): Promise<{ user: User; token: string }> => {
  const user = await createUser(roleName);
  const token = await getAuthorizationToken(app, {
    email: user.email,
    password: "Test123456",
  });

  return { user, token };
};

export function createMany<T>(model: string, data: Partial<T>[]) {
  return Promise.all(
    data.map((item) => {
      return factory.create(model, item);
    }),
  );
}

export const getRequest = () => {
  if (req) return req;
  req = request(app.callback());
  return req;
};

export async function truncate(table: string, knx: any = knex) {
  await knx.raw("SET FOREIGN_KEY_CHECKS = 0;");
  await knx.raw(`TRUNCATE TABLE ${table};`);
  await knx.raw("SET FOREIGN_KEY_CHECKS = 1;");
}

export async function truncateAllTables() {
  await truncate("user_roles");
  await truncate("users");
  await truncate("user_procedures");
  await truncate("procedures");
  await truncate("procedure_processes");
}
