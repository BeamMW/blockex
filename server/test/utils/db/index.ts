import * as mysql from "mysql";

import { ENVIRONMENT } from "../../../app/shared/constants";

const { connection } = require("../../../knexfile")[ENVIRONMENT.test];

let mysqlClient: mysql.Connection = null;

const getMysqlClient = async () => {
  if (!mysqlClient) {
    mysqlClient = await new Promise((res, rej) => {
      const client = mysql.createConnection({
        host: connection.host,
        port: connection.port,
        user: connection.user,
        password: connection.password,
      });
      client.connect(function (err) {
        if (err) {
          rej(err);
        } else {
          res(client);
        }
      });
    });
  }
  return mysqlClient;
};

const makeQuery = async (queryString: string, params: string[]) => {
  const client = await getMysqlClient();
  const query = mysql.format(queryString, params);
  await new Promise((res, rej) => {
    client.query(query, function (err, result) {
      if (err) {
        rej(err);
      } else {
        res(result);
      }
    });
  });
};

export const createDb = async () =>
  makeQuery("CREATE DATABASE ?? DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci", [connection.database]);

export const dropDb = async () => makeQuery("DROP DATABASE IF EXISTS ??", [connection.database]);

export const close = () => {
  if (mysqlClient) {
    mysqlClient.end();
    mysqlClient = null;
  }
};
