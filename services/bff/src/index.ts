import { resolve } from 'path' // eslint-disable-line import/order
import dotenv from 'dotenv-flow' // eslint-disable-line import/order
dotenv.config({ path: resolve(__dirname, '..') })

import http from 'http'

import { createTerminus } from '@godaddy/terminus'
import d from 'debug'

import apollo from './apollo'
import app from './app'

export function startApp(): void {
  const debug = d('services:server')

  function normalizePort(val: string): string | number | boolean {
    const port = parseInt(val, 10)

    if (isNaN(port)) {
      return val
    }

    if (port >= 0) {
      return port
    }

    return false
  }

  const port = normalizePort(process.env.PORT || '3000')
  app.set('port', port)

  const server = http.createServer(app)

  apollo(app, server)

  /**
   * Health check
   */
  async function onHealthCheck(): Promise<boolean> {
    // Add health check here
    return Promise.resolve(true)
  }

  function onSignal(): Promise<void> {
    // Graceful shutdown goes here
    return Promise.resolve()
  }

  createTerminus(server, {
    signal: 'SIGINT',
    healthChecks: { '/healthcheck': onHealthCheck },
    onSignal,
  })

  function onError(error: Error & { syscall?: string; code?: string }): void {
    if (error.syscall !== 'listen') {
      throw error
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges')
        process.exit(1)
        break
      case 'EADDRINUSE':
        console.error(bind + ' is already in use')
        process.exit(1)
        break
      default:
        throw error
    }
  }

  function onListening(): void {
    const addr = server.address()
    if (addr === null) {
      throw new Error('No address')
    }
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
    debug('Listening on ' + bind)
  }

  server.listen(port)
  server.on('error', onError)
  server.on('listening', onListening)
}
