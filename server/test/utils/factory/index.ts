import { ObjectionAdapter } from "./adapter";
import * as knexModels from "../../../app/models";

const FactoryGirl = require("factory-girl");
const factory = FactoryGirl.factory;

const dates = {
  created_at: new Date(),
  updated_at: new Date(),
};

factory.setAdapter(new ObjectionAdapter());

factory.define("User", knexModels.User, {
  first_name: factory.sequence("user.first_name", (n: number) => `first_name${n}`),
  last_name: factory.sequence("user.last_name", (n: number) => `last_name${n}`),
  email: factory.sequence("user.login", (n: number) => `login${n}@test.com`),
  password_hash: "$2a$10$8KHeEFxsoHNCC3BWGa8DqesueVbTahPaiGFOxGxLIgKMTCXr5JSdG",
  is_active: true,
  confirmation_hash: "1111",
  created_by: "system",
  updated_by: "system",
  ...dates,
} as knexModels.User);

factory.define("Role", knexModels.Role, {
  id: factory.sequence("Role.id", (n: number) => n),
  name: factory.sequence("Role.name", (n: number) => `name${n}`),
  description: factory.sequence("Role.description", (n: number) => `description${n}`),
  created_by: "test",
  updated_by: "test",
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date(),
});

factory.define("UserRole", knexModels.UserRole, {
  role_id: factory.assoc("Role", "id"),
  user_id: factory.assoc("User", "id"),
});

export default factory;
