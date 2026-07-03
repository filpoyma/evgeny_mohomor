import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { User } from '@prisma/client'

declare module 'fastify' {
  interface FastifyRequest {
    user: User
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

/**
 * Authentication plugin.
 * Resolves the Telegram user from X-TG-User-Id header (with development fallback)
 * and registers auth decorators/hooks.
 */
export default fp(
  async (fastify: FastifyInstance) => {
    // Development fallback ID (matches our seeded admin user)
    const DEV_USER_ID = fastify.config.DEV_USER_ID

    fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
      let tgId = request.headers['x-tg-user-id'] as string

      // If no ID header, fallback in development
      if (!tgId) {
        if (fastify.config.NODE_ENV === 'development') {
          tgId = DEV_USER_ID
        } else {
          return reply.code(401).send({ error: 'Unauthorized', message: 'Missing Telegram User ID' })
        }
      }

      // Upsert user based on headers (ensures database sync on first request)
      const username = (request.headers['x-tg-username'] as string) || ''
      const firstName = (request.headers['x-tg-first-name'] as string) || 'User'
      const lastName = (request.headers['x-tg-last-name'] as string) || ''

      try {
        const adminIds = fastify.config.ADMIN_CHAT_ID
          ? fastify.config.ADMIN_CHAT_ID.split(',').map((id) => id.trim())
          : [];
        const isAdmin = tgId === DEV_USER_ID || adminIds.includes(tgId);

        let user = await fastify.prisma.user.findUnique({
          where: { id: tgId }
        })

        if (!user) {
          // Check if there is a referral source in the headers
          const refSource = request.headers['x-tg-ref-source'] as string
          let referredById: string | null = null

          if (refSource && refSource.startsWith('ref_')) {
            const potentialReferrerId = refSource.substring(4)
            if (potentialReferrerId !== tgId) {
              const referrer = await fastify.prisma.user.findUnique({
                where: { id: potentialReferrerId }
              })
              if (referrer) {
                referredById = potentialReferrerId
              }
            }
          }

          user = await fastify.prisma.user.create({
            data: {
              id: tgId,
              username,
              firstName,
              lastName,
              role: isAdmin ? 1 : 0,
              region: 'Russia',
              currency: 'RUB',
              referredById
            }
          })
        } else {
          // Keep username and names updated
          user = await fastify.prisma.user.update({
            where: { id: tgId },
            data: {
              username: username || user.username,
              firstName: firstName || user.firstName,
              lastName: lastName || user.lastName,
              role: isAdmin ? 1 : 0
            }
          })
        }

        request.user = user
      } catch (err) {
        fastify.log.error(err, 'Failed to authenticate user')
        return reply.code(500).send({ error: 'Internal Server Error', message: 'Auth database error' })
      }
    })

    fastify.decorate('requireAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
      // First, ensure authenticate has run and populated request.user
      if (!request.user) {
        await fastify.authenticate(request, reply)
        if (reply.sent) return
      }

      if (request.user.role !== 1) {
        return reply.code(403).send({ error: 'Forbidden', message: 'Admin access required' })
      }
    })
  },
  {
    name: 'auth',
    dependencies: ['prisma', '@fastify/env']
  }
)
