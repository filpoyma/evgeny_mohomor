import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';

type AppConfig = FastifyInstance['config'];

/**
 * Resolves the base URL Swagger UI uses for "Try it out" requests.
 * HOST=0.0.0.0 is valid for listen() but browsers cannot fetch it (CSP).
 */
export const resolvePublicApiUrl = (config: AppConfig): string => {
  if (config.PUBLIC_API_URL) {
    return config.PUBLIC_API_URL.replace(/\/$/, '');
  }

  const host =
    config.HOST === '0.0.0.0' || config.HOST === '::' ? 'localhost' : config.HOST;

  return `http://${host}:${config.PORT}`;
};

/**
 * Generates an OpenAPI document and exposes Swagger UI at /docs.
 * Controlled by `SWAGGER_ENABLED` in environment config.
 *
 * @see https://github.com/fastify/fastify-swagger
 */
export default fp(
  async (fastify: FastifyInstance) => {
    if (!fastify.config.SWAGGER_ENABLED) return;

    const publicApiUrl = resolvePublicApiUrl(fastify.config);

    await fastify.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Goldzen API',
          description: 'Goldzen API skeleton built with Fastify, Prisma and Redis.',
          version: 'v1',
        },
        servers: [
          {
            url: publicApiUrl,
            description: fastify.config.PUBLIC_API_URL ? 'Configured' : 'Local (derived)',
          },
        ],
      },
    });

    await fastify.register(fastifySwaggerUi, {
      routePrefix: '/api/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
    });
  },
  {
    name: 'swagger',
    dependencies: ['@fastify/env'],
  }
);
