import fp from 'fastify-plugin'
import fastifyCors, { type FastifyCorsOptions } from '@fastify/cors'
import type { FastifyInstance } from 'fastify'

/**
 * Cross-Origin Resource Sharing.
 * Wrapped in fp so it can declare a dependency on @fastify/env and read
 * `fastify.config.CORS_ORIGINS` at registration time.
 *
 * @see https://github.com/fastify/fastify-cors
 */
export default fp(
  async (fastify: FastifyInstance) => {
    const raw = fastify.config.CORS_ORIGINS.trim()
    const allowed = raw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    const origin: FastifyCorsOptions['origin'] =
      raw === '' || raw === '*' ? true : allowed

    await fastify.register(fastifyCors, {
      origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    })
  },
  {
    name: 'cors',
    dependencies: ['@fastify/env']
  }
)
