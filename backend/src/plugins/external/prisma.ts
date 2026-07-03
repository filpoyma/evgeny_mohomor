import fp from 'fastify-plugin'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/index.js'
import type { FastifyInstance } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

/**
 * Registers a single PrismaClient instance for the lifetime of the app
 * and disconnects it gracefully on close.
 *
 * Prisma 7 uses a driver adapter for direct PostgreSQL connections.
 * @see https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections
 */
export default fp(
  async (fastify: FastifyInstance) => {
    const adapter = new PrismaPg({
      connectionString: fastify.config.DATABASE_URL
    })

    const prisma = new PrismaClient({
      adapter,
      log:
        fastify.config.LOG_LEVEL === 'debug' || fastify.config.LOG_LEVEL === 'trace'
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error']
    })

    await prisma.$connect()
    fastify.decorate('prisma', prisma)

    fastify.addHook('onClose', async (instance) => {
      await instance.prisma.$disconnect()
    })
  },
  {
    name: 'prisma',
    dependencies: ['@fastify/env']
  }
)
