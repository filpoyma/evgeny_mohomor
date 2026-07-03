import { Type, type FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

/**
 * Payments module — stub.
 * Mounted at `/api/payments` by autoload (dirNameRoutePrefix).
 */
const payments: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/',
    {
      schema: {
        tags: ['payments'],
        response: {
          200: Type.Object({
            module: Type.Literal('payments'),
            status: Type.Literal('stub')
          })
        }
      }
    },
    async () => ({ module: 'payments' as const, status: 'stub' as const })
  )
}

export default payments
