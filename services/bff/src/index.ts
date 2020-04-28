import AWS from 'aws-sdk'
import { resolve } from 'path' // eslint-disable-line import/order
import dotenv from 'dotenv-flow' // eslint-disable-line import/order
dotenv.config({ path: resolve(__dirname, '..') })

import http from 'http'

import { createTerminus } from '@godaddy/terminus'
import d from 'debug'

import apollo from './apollo'
import app from './app'

if (!process.env.MONGO_DB_PASSWORD || !process.env.MONGO_DB_USER) {
  const region = 'us-east-1'
  const secretName = 'enlighten-mongodb-credentials'
  const client = new AWS.SecretsManager({
    region,
  })

  client.getSecretValue({ SecretId: secretName }, function(err, data) {
    if (err) {
      if (err.code === 'DecryptionFailureException')
        // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
        // Deal with the exception here, and/or rethrow at your discretion.
        throw err
      else if (err.code === 'InternalServiceErrorException')
        // An error occurred on the server side.
        // Deal with the exception here, and/or rethrow at your discretion.
        throw err
      else if (err.code === 'InvalidParameterException')
        // You provided an invalid value for a parameter.
        // Deal with the exception here, and/or rethrow at your discretion.
        throw err
      else if (err.code === 'InvalidRequestException')
        // You provided a parameter value that is not valid for the current state of the resource.
        // Deal with the exception here, and/or rethrow at your discretion.
        throw err
      else if (err.code === 'ResourceNotFoundException')
        // We can't find the resource that you asked for.
        // Deal with the exception here, and/or rethrow at your discretion.
        throw err
    } else {
      // Decrypts secret using the associated KMS CMK.
      // Depending on whether the secret is a string or binary, one of these fields will be populated.
      if (data.SecretString !== undefined) {
        const secret: {
          'enlighten-mongodb-username': string
          'enlighten-mongodb-password': string
        } = JSON.parse(data.SecretString)
        process.env.MONGO_DB_USER = secret['enlighten-mongodb-username']
        process.env.MONGO_DB_PASSWORD = secret['enlighten-mongodb-password']
      }
    }
  })
}

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
