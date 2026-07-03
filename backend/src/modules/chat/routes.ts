import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import * as handlers from './handlers.js'
import * as schema from './schema.js'

export const chatRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/articles',
    {
      schema: schema.listArticlesSchema,
      preHandler: fastify.authenticate
    },
    handlers.listArticles
  )
}

export default chatRoutes
