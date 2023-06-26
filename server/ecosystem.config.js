module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: "API",
      script: "./app/app.ts",
      instances: 1,
      interpreter: "node_modules/.bin/ts-node",
    },
  ],
};
