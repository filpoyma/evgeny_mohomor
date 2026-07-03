/**
 * Composes the application: loads external plugins, app-level plugins,
 * business modules, and registers global error / not-found handlers.
 *
 * To run as a standalone executable see `server.ts`.
 */
import path from 'node:path';
import fastifyAutoload from '@fastify/autoload';
import type { FastifyError, FastifyInstance, FastifyPluginOptions } from 'fastify';
import { isDev } from './lib/constants/app.constants.js';

export default async function serviceApp(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // Required by some test setups; harmless in production.
  delete opts.skipOverride;

  // 1. External plugins — third-party infrastructure (env, prisma, redis, ...).
  //    Awaited so app-level plugins below see all decorators.
  await fastify.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, 'plugins/external'),
    options: {},
  });

  // 2. App-level plugins — cross-cutting concerns (auth, system endpoints, ...).
  //    Routes registered here live OUTSIDE the /api prefix.
  //    Plugins that need root paths (e.g. /health) export prefixOverride = ''.
  fastify.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, 'plugins/app'),
    indexPattern: /^index\.(ts|js)$/,
    dirNameRoutePrefix: true,
    options: { ...opts },
  });

  // 3. Business modules — feature-first vertical slices.
  //    `indexPattern` keeps autoload from registering service/repository/...
  //    as plugins. `dirNameRoutePrefix` mounts modules at /api/<dir-name>.
  fastify.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, 'modules'),
    indexPattern: /^index\.(ts|js)$/,
    dirNameRoutePrefix: true,
    autoHooks: true,
    cascadeHooks: true,
    options: { ...opts, prefix: '/api/mushroom-bot' },
  });

  // ---- Error handling ------------------------------------------------------
  fastify.setErrorHandler((err: FastifyError, request, reply) => {
    request.log.error(
      {
        err,
        request: {
          method: request.method,
          url: request.url,
          query: request.query,
          params: request.params,
        },
      },
      'Unhandled error occurred'
    );

    // Validation errors: AJV-driven, always 400 with structured details.
    if (err.validation) {
      return reply.code(400).send({
        statusCode: 400,
        code: err.code ?? 'FST_ERR_VALIDATION',
        error: 'Bad Request',
        message: err.message,
        details: err.validation,
      });
    }

    const statusCode = err.statusCode ?? 500;
    const isClientError = statusCode >= 400 && statusCode < 500;

    // Hide internal details for 5xx in non-dev environments.
    const message = isClientError || isDev ? err.message : 'Internal Server Error';

    return reply.code(statusCode).send({
      statusCode,
      code: err.code ?? (statusCode >= 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST'),
      error: err.name && err.name !== 'Error' ? err.name : (reply.raw.statusMessage ?? 'Error'),
      message,
    });
  });

  // Rate-limited 404 prevents URL probing.
  fastify.setNotFoundHandler(
    {
      preHandler: fastify.rateLimit({
        max: 3,
        timeWindow: 500,
      }),
    },
    (request, reply) => {
      request.log.warn(
        {
          request: {
            method: request.method,
            url: request.url,
          },
        },
        'Resource not found'
      );

      reply.code(404).send({
        statusCode: 404,
        code: 'NOT_FOUND',
        error: 'Not Found',
        message: `Route ${request.method} ${request.url} not found`,
      });
    }
  );
}
