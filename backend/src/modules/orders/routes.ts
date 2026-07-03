import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import * as handlers from './handlers.js'
import * as schema from './schema.js'

export const ordersRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  // User endpoints
  fastify.post(
    '/',
    {
      schema: schema.createOrderSchema,
      preHandler: fastify.authenticate
    },
    handlers.createOrder
  )

  fastify.get(
    '/',
    {
      schema: schema.listOrdersSchema,
      preHandler: fastify.authenticate
    },
    handlers.listUserOrders
  )

  // Admin endpoints
  fastify.get(
    '/admin/all',
    {
      schema: schema.listAllOrdersSchema,
      preHandler: fastify.requireAdmin
    },
    handlers.listAllOrders
  )

  fastify.put(
    '/admin/:id/status',
    {
      schema: schema.updateOrderStatusSchema,
      preHandler: fastify.requireAdmin
    },
    handlers.updateStatus
  )
}

export default ordersRoutes
