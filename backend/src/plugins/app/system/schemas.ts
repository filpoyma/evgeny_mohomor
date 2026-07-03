import { Type } from '@sinclair/typebox';

export const RootResponseSchema = Type.Object({
  name: Type.String(),
  version: Type.String(),
  docs: Type.String(),
});

export const HealthCheckSchema = Type.Object({
  status: Type.Union([Type.Literal('ok'), Type.Literal('degraded')]),
  uptime: Type.Number(),
  timestamp: Type.String({ format: 'date-time' }),
  checks: Type.Object({
    database: Type.Boolean(),
    cache: Type.Boolean(),
  }),
});
