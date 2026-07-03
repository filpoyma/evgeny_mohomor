import type { FastifyReply } from 'fastify'
import { createUsersService } from './service.js'
import { NotFoundError } from '../../lib/errors.js'

export async function getProfile(request: any, _reply: FastifyReply) {
  // request.user is populated by authenticate preHandler
  return { data: request.user }
}

export async function updateProfile(
  request: any,
  _reply: FastifyReply
) {
  const service = createUsersService(request.server)
  const updatedUser = await service.updateProfile(request.user.id, request.body)
  return { data: updatedUser }
}

export async function listUsers(request: any, _reply: FastifyReply) {
  const service = createUsersService(request.server)
  const users = await service.getAllUsers()
  return { data: users }
}

export async function adjustUserBalance(
  request: any,
  _reply: FastifyReply
) {
  const service = createUsersService(request.server)
  try {
    const updatedUser = await service.adjustBalance(request.params.id, request.body.amount)
    return { data: updatedUser }
  } catch (err) {
    throw new NotFoundError('User')
  }
}
