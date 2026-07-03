# Plugins

`external/` — third-party plugins (env, prisma, redis, helmet, cors, ...).
Loaded first; provide decorators (`fastify.config`, `fastify.prisma`,
`fastify.redis`, `fastify.httpErrors`, ...) that the rest of the app relies on.

`app/` — application-wide cross-cutting concerns (auth, system / health
endpoints, request decorators). Loaded after `external/` and before modules.
Routes defined here live **outside** the `/api` prefix — they are
infrastructure, not business endpoints (`GET /`, `GET /health`, ...).

Both folders are auto-loaded via `@fastify/autoload`.
