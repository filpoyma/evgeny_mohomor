import fastifyRedis from '@fastify/redis'
import type { FastifyInstance } from 'fastify'

export const autoConfig = (fastify: FastifyInstance) => {
  return {
    url: fastify.config.REDIS_URL,
    closeClient: true
  }
}

/**
 * Exposes a shared `ioredis` client on `fastify.redis`.
 * @see https://github.com/fastify/fastify-redis
 */
export default fastifyRedis
