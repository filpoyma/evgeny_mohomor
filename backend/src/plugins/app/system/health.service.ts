import type { FastifyInstance } from 'fastify';

export type HealthChecks = {
  database: boolean;
  cache: boolean;
};

export const checkDependencies = async (fastify: FastifyInstance) => {
  const checks: HealthChecks = {
    database: false,
    cache: false,
  };

  try {
    await fastify.prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (err) {
    fastify.log.warn({ err }, 'database health check failed');
  }

  try {
    const pong = await fastify.redis.ping();
    checks.cache = pong === 'PONG';
  } catch (err) {
    fastify.log.warn({ err }, 'redis health check failed');
  }

  return {
    checks,
    allHealthy: checks.database && checks.cache,
  };
};
