module.exports = {
  apps: [
    {
      name: "bff",
      script: "index.js",
      instances: 1,
      exec_mode: "cluster", // eslint-disable-line @typescript-eslint/camelcase
    },
  ],
};
