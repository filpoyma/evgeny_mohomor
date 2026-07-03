import helmet from '@fastify/helmet'

export const autoConfig = {
  global: true
}

/**
 * Sets recommended security HTTP headers.
 * @see https://github.com/fastify/fastify-helmet
 */
export default helmet
