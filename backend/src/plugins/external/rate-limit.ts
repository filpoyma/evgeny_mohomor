import fastifyRateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'

export const autoConfig = (fastify: FastifyInstance) => {
  return {
    max: fastify.config.RATE_LIMIT_MAX,
    timeWindow: fastify.config.RATE_LIMIT_TIME_WINDOW
  }
}

/**
 * Low-overhead rate limiter for routes.
 * @see https://github.com/fastify/fastify-rate-limit
 */
export default fastifyRateLimit
