import type { FastifyReply } from 'fastify'
import { createOrdersService } from './service.js'

export async function createOrder(
  request: any,
  _reply: FastifyReply
) {
  const service = createOrdersService(request.server)
  const order = await service.create(request.user.id, request.body)
  return { data: order }
}

export async function listUserOrders(request: any, _reply: FastifyReply) {
  const service = createOrdersService(request.server)
  const orders = await service.getByUserId(request.user.id)
  return { data: orders }
}

export async function listAllOrders(request: any, _reply: FastifyReply) {
  const service = createOrdersService(request.server)
  const orders = await service.getAll()
  return { data: orders }
}

export async function updateStatus(
  request: any,
  _reply: FastifyReply
) {
  const service = createOrdersService(request.server)
  const order = await service.updateStatus(request.params.id, request.body.status)
  return { data: order }
}
