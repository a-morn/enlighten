const cluster = require('cluster')
const NUMBER_OF_INSTACES = 2

if (cluster.isMaster) {
  for (let i = 0; i < NUMBER_OF_INSTACES; i++) {
    cluster.fork()
  }

  cluster.on('exit', worker => {
    console.log(`worker ${worker.process.pid} died`)
  })
} else {
  require('./dist/index').startApp()

  console.log(`Worker ${process.pid} started`)
}
