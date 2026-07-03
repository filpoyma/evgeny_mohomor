import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { usersRoutes } from './routes.js'

/**
 * Users module.
 * Registered by Autoload at /api/v1/users.
 */
const users: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.register(usersRoutes)
}

export default users
