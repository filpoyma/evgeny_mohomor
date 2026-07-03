import type { FastifyInstance } from 'fastify'

export function createProductsService(fastify: FastifyInstance) {
  const prisma = fastify.prisma

  return {
    async getAll() {
      const items = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return items
    },

    async create(data: {
      name: string
      description: string
      category: string
      priceIdr: number
      priceVnd: number
      priceUsdt: number
      priceRub: number
      imageUrl: string
      size: string
      stock: number
    }) {
      const item = await prisma.product.create({
        data
      })
      return item
    },

    async update(id: string, data: Partial<{
      name: string
      description: string
      category: string
      priceIdr: number
      priceVnd: number
      priceUsdt: number
      priceRub: number
      imageUrl: string
      size: string
      stock: number
    }>) {
      const item = await prisma.product.update({
        where: { id },
        data
      })
      return item
    },

    async delete(id: string) {
      await prisma.product.delete({
        where: { id }
      })
      return true
    }
  }
}
