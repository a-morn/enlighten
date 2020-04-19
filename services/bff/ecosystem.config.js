module.exports = {
  apps: [
    {
      name: 'bff',
      script: 'production-start.js',
      instances: 0,
      exec_mode: 'cluster', // eslint-disable-line @typescript-eslint/camelcase
    },
  ],
}
