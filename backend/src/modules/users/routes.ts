import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import * as handlers from './handlers.js'
import * as schema from './schema.js'

export const usersRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  // Profile endpoints
  fastify.get(
    '/profile',
    {
      schema: schema.getProfileSchema,
      preHandler: fastify.authenticate
    },
    handlers.getProfile
  )

  fastify.put(
    '/profile',
    {
      schema: schema.updateProfileSchema,
      preHandler: fastify.authenticate
    },
    handlers.updateProfile
  )

  // Admin endpoints
  fastify.get(
    '/admin/users',
    {
      schema: schema.listUsersSchema,
      preHandler: fastify.requireAdmin
    },
    handlers.listUsers
  )

  fastify.put(
    '/admin/users/:id/balance',
    {
      schema: schema.adjustBalanceSchema,
      preHandler: fastify.requireAdmin
    },
    handlers.adjustUserBalance
  )
}

export default usersRoutes
