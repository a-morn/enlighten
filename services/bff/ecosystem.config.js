module.exports = {
  apps: [
    {
      name: 'bff',
      script: 'production-start.js',
      instances: 1,
      exec_mode: 'cluster', // eslint-disable-line @typescript-eslint/camelcase
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
