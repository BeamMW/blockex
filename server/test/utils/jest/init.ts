import { knex as Knex } from "knex";

import { ENVIRONMENT } from "../../../app/shared/constants";
import { dropDb, createDb, close } from "../db";

const { client, connection } = require("../../../knexfile")[ENVIRONMENT.test];

module.exports = async function () {
  console.info(`[${ENVIRONMENT.test}] creating db ${connection.database}`);
  await dropDb();
  await createDb();
  await close();

  const newKnex = Knex({
    client,
    connection,
  });

  console.info(`[${ENVIRONMENT.test}] migrating db ${connection.database}`);
  await newKnex.migrate.latest();
  await newKnex.destroy();
};
