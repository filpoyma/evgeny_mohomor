/**
 * Standalone application entry point.
 *
 * Boots Fastify, registers the application as a plugin, and wires up
 * graceful shutdown via close-with-grace.
 */
import Fastify, { type FastifyServerOptions } from 'fastify'
import fp from 'fastify-plugin'
import closeWithGrace from 'close-with-grace'

import serviceApp from './app.js'

/**
 * Logger config:
 *  - pretty output when running in an interactive TTY (local dev)
 *  - structured JSON otherwise (production / containers)
 */
function getLoggerOptions(): FastifyServerOptions['logger'] {
  if (process.stdout.isTTY) {
    return {
      level: process.env.LOG_LEVEL ?? 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'SYS:HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    }
  }

  return {
    level: process.env.LOG_LEVEL ?? 'info',
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        '*.password',
        '*.token',
        '*.secret'
      ],
      censor: '[REDACTED]'
    }
  }
}

const app = Fastify({
  logger: getLoggerOptions(),
  // Recommended timeouts to prevent slow / idle clients from holding sockets.
  connectionTimeout: 120_000,
  requestTimeout: 60_000,
  keepAliveTimeout: 10_000,
  http: {
    headersTimeout: 15_000
  },
  ajv: {
    customOptions: {
      coerceTypes: 'array',
      removeAdditional: 'all'
    }
  },
  trustProxy: true,
  bodyLimit: 10 * 1024 * 1024 // 10 MB
})

async function init() {
  // Use fp() so the user-defined error handler is not encapsulated.
  app.register(fp(serviceApp))

  closeWithGrace(
    {
      delay: Number(process.env.FASTIFY_CLOSE_GRACE_DELAY ?? 500)
    },
    async ({ err, signal }) => {
      if (err) {
        app.log.error({ err }, 'Server closing due to error')
      } else if (signal) {
        app.log.info({ signal }, 'Server closing due to signal')
      }
      await app.close()
    }
  )

  try {
    await app.ready()
    await app.listen({
      port: Number(process.env.PORT ?? 3000),
      host: process.env.HOST ?? '0.0.0.0'
    })
  } catch (err) {
    app.log.error({ err }, 'Failed to start server')
    process.exit(1)
  }
}

init()
