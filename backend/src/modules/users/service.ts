import type { FastifyInstance } from 'fastify'

export function createUsersService(fastify: FastifyInstance) {
  const prisma = fastify.prisma

  return {
    async getById(id: string) {
      return prisma.user.findUnique({
        where: { id }
      })
    },

    async updateProfile(id: string, data: { region?: string; currency?: string; address?: string }) {
      return prisma.user.update({
        where: { id },
        data
      })
    },

    async getAllUsers() {
      return prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      })
    },

    async adjustBalance(id: string, amount: number) {
      const user = await prisma.user.findUnique({
        where: { id }
      })
      if (!user) throw new Error('User not found')

      return prisma.user.update({
        where: { id },
        data: {
          bonusBalance: {
            increment: amount
          }
        }
      })
    }
  }
}
