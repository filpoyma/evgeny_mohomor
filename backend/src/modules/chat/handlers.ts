import type { FastifyReply } from 'fastify'
import { createArticlesService } from './service.js'

export async function listArticles(request: any, _reply: FastifyReply) {
  const service = createArticlesService(request.server)
  const articles = await service.getAll()
  return { data: articles }
}
