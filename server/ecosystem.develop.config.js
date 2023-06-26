module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: "develop",
      script: "./app/app.ts",
      watch: ["app"],
      ignore_watch: ["node_modules", "dist"],
      interpreter: "node_modules/.bin/ts-node",
    },
  ],
};
