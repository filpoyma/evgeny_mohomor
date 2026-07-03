import fp from 'fastify-plugin'
import fastifyUnderPressure from '@fastify/under-pressure'
import type { FastifyInstance } from 'fastify'

export const autoConfig = (fastify: FastifyInstance) => {
  return {
    maxEventLoopDelay: 1000,
    maxHeapUsedBytes: 256_000_000,
    maxRssBytes: 1_000_000_000,
    maxEventLoopUtilization: 0.98,
    message: 'Server is under pressure, retry later',
    retryAfter: 50,
    healthCheck: async () => {
      try {
        await fastify.prisma.$queryRaw`SELECT 1`
        fastify.log.info('PostgreSQL connected successfully')
        await fastify.redis.ping()
        fastify.log.info('Redis connected successfully')
        return true
      } catch (err) {
        fastify.log.error({ err }, 'health check failed')
        return false
      }
    },
    //healthCheckInterval: 5000,
    exposeStatusRoute: '/health/status'
  }
}

/**
 * Measures process load and returns 503 when the server is under pressure.
 * Wrapped with fp so its decorators (e.g. memoryUsage) propagate correctly,
 * and declared dependencies make autoload register prisma + redis first.
 *
 * @see https://github.com/fastify/under-pressure
 */
export default fp(fastifyUnderPressure, {
  name: 'under-pressure',
  dependencies: ['prisma', '@fastify/redis']
})
