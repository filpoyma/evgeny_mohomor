import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import * as handlers from './handlers.js'
import * as schema from './schema.js'

export const productsRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  // Publicly readable for authenticated Web App users
  fastify.get(
    '/',
    {
      schema: schema.listProductsSchema,
      preHandler: fastify.authenticate
    },
    handlers.listProducts
  )

  // Write actions are restricted to Admins only
  fastify.post(
    '/',
    {
      schema: schema.createProductSchema,
      preHandler: fastify.requireAdmin
    },
    handlers.createProduct
  )

  fastify.put(
    '/:id',
    {
      schema: schema.updateProductSchema,
      preHandler: fastify.requireAdmin
    },
    handlers.updateProduct
  )

  fastify.delete(
    '/:id',
    {
      schema: schema.deleteProductSchema,
      preHandler: fastify.requireAdmin
    },
    handlers.deleteProduct
  )
}
export default productsRoutes
