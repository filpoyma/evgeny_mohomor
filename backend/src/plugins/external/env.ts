import env from '@fastify/env'

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      NODE_ENV: 'development' | 'test' | 'production'
      HOST: string
      PORT: number
      LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'

      DATABASE_URL: string
      REDIS_URL: string

      RATE_LIMIT_MAX: number
      RATE_LIMIT_TIME_WINDOW: string

      CORS_ORIGINS: string

      SWAGGER_ENABLED: boolean
      /** Public base URL for OpenAPI/Swagger (e.g. http://localhost:3000 or https://api.example.com). */
      PUBLIC_API_URL: string

      FASTIFY_CLOSE_GRACE_DELAY: number

      TELEGRAM_BOT_TOKEN: string
      TELEGRAM_BOT_USERNAME: string
      ADMIN_CHAT_ID: string
      TELEGRAM_BOT_MODE: 'polling' | 'webhook'
      TELEGRAM_WEBHOOK_URL: string
      TELEGRAM_MINI_APP_URL: string
      DEV_USER_ID: string
    }
  }
}

const schema = {
  type: 'object',
  required: ['DATABASE_URL', 'REDIS_URL', 'CORS_ORIGINS', 'TELEGRAM_BOT_TOKEN'],
  properties: {
    NODE_ENV: {
      type: 'string',
      enum: ['development', 'test', 'production'],
      default: 'development'
    },
    HOST: { type: 'string', default: '0.0.0.0' },
    PORT: { type: 'number', default: 3000 },
    LOG_LEVEL: {
      type: 'string',
      enum: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: 'info'
    },

    DATABASE_URL: { type: 'string', minLength: 1 },
    REDIS_URL: { type: 'string', minLength: 1 },

    RATE_LIMIT_MAX: { type: 'number', default: 100 },
    RATE_LIMIT_TIME_WINDOW: { type: 'string', default: '1 minute' },

    CORS_ORIGINS: { type: 'string', default: '' },

    SWAGGER_ENABLED: { type: 'boolean', default: false },
    PUBLIC_API_URL: { type: 'string', default: '' },

    FASTIFY_CLOSE_GRACE_DELAY: { type: 'number', default: 500 },

    TELEGRAM_BOT_TOKEN: { type: 'string', minLength: 1 },
    TELEGRAM_BOT_USERNAME: { type: 'string', default: '' },
    ADMIN_CHAT_ID: { type: 'string', default: '' },
    TELEGRAM_BOT_MODE: { type: 'string', enum: ['polling', 'webhook'], default: 'polling' },
    TELEGRAM_WEBHOOK_URL: { type: 'string', default: '' },
    TELEGRAM_MINI_APP_URL: { type: 'string', default: 'http://localhost:5173' },
    DEV_USER_ID: { type: 'string', default: '147917436' }
  }
}

export const autoConfig = {
  confKey: 'config',
  schema,
  dotenv: true,
  data: process.env
}

/**
 * Validates and exposes environment variables on `fastify.config`.
 * @see https://github.com/fastify/fastify-env
 */
export default env
