import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { ordersRoutes } from './routes.js'

/**
 * Orders module.
 * Registered by Autoload at /api/v1/orders.
 */
const orders: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.register(ordersRoutes)
}

export default orders
