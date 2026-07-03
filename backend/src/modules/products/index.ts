import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { productsRoutes } from './routes.js'

/**
 * Products module.
 * Registered by Autoload at /api/v1/products.
 */
const products: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.register(productsRoutes)
}

export default products
