import type { FastifyReply } from 'fastify'
import { createProductsService } from './service.js'

export async function listProducts(request: any, _reply: FastifyReply) {
  const service = createProductsService(request.server)
  const products = await service.getAll()
  return { data: products }
}

export async function createProduct(
  request: any,
  _reply: FastifyReply
) {
  const service = createProductsService(request.server)
  const product = await service.create(request.body)
  return { data: product }
}

export async function updateProduct(
  request: any,
  _reply: FastifyReply
) {
  const service = createProductsService(request.server)
  const product = await service.update(request.params.id, request.body)
  return { data: product }
}

export async function deleteProduct(
  request: any,
  _reply: FastifyReply
) {
  const service = createProductsService(request.server)
  await service.delete(request.params.id)
  return { success: true }
}
