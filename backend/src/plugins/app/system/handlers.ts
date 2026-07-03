import type { FastifyReply, FastifyRequest } from 'fastify';
import { checkDependencies } from './health.service.js';

export const getRootHandler = async () => ({
  name: 'Goldzen API',
  version: '1.0.0',
  docs: '/api/docs',
});

export const getHealthHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { checks, allHealthy } = await checkDependencies(request.server);

  return reply.code(allHealthy ? 200 : 503).send({
    status: allHealthy ? 'ok' : 'degraded',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks,
  });
};
