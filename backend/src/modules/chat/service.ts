import type { FastifyInstance } from 'fastify'

export function createArticlesService(fastify: FastifyInstance) {
  const prisma = fastify.prisma

  return {
    async getAll() {
      return prisma.article.findMany({
        orderBy: { createdAt: 'desc' }
      })
    }
  }
}
