import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { chatRoutes } from './routes.js'

/**
 * Chat (Articles) module.
 * Registered by Autoload at /api/v1/chat.
 */
const chat: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.register(chatRoutes)
}

export default chat
