/**
 * System endpoints (root banner + Kubernetes-style health probes).
 *
 * Lives in `plugins/app/` because it is infrastructure, not a business
 * domain — it must NOT sit under the `/api` prefix that modules use.
 */
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { HealthCheckSchema, RootResponseSchema } from './schemas.js';
import { getHealthHandler, getRootHandler } from './handlers.js';

const system: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/',
    {
      schema: {
        tags: ['system'],
        response: {
          200: RootResponseSchema,
        },
      },
    },
    getRootHandler
  );

  // Readiness — dependencies reachable (k8s readinessProbe).
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['system'],
        response: {
          200: HealthCheckSchema,
          503: HealthCheckSchema,
        },
      },
      config: { rateLimit: false },
    },
    getHealthHandler
  );
};

/**
 * Wrapped in fp so routes register at the parent (root) scope rather than
 * inside an encapsulated child context.
 *
 * With dirNameRoutePrefix: true autoload would mount this plugin at /system.
 * Empty string keeps routes at the app root: /, /health, /health/live.
 */
export const prefixOverride = '';

export default system;
