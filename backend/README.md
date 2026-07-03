# Goldzen API — Fastify

Skeleton of the Goldzen backend on **Fastify 5** + **TypeScript** with
**PostgreSQL (Prisma)** and **Redis**.

Inspired by the [official `fastify/demo`](https://github.com/fastify/demo)
project structure.

## Stack

| Concern              | Tool                                                       |
| -------------------- | ---------------------------------------------------------- |
| HTTP framework       | [Fastify 5](https://fastify.dev)                           |
| Plugin loader        | `@fastify/autoload`                                        |
| Config validation    | `@fastify/env` (JSON Schema)                               |
| HTTP error helpers   | `@fastify/sensible` + `@fastify/error`                     |
| Security             | `@fastify/helmet`, `@fastify/cors`, `@fastify/rate-limit`  |
| Health               | `GET /health` (readiness), `GET /health/status` (load)     |
| Cookies              | `@fastify/cookie`                                          |
| Docs                 | `@fastify/swagger` + UI at `/api/docs` if `SWAGGER_ENABLED` |
| Validation / typing  | `@fastify/type-provider-typebox` + `@sinclair/typebox`     |
| ORM                  | [Prisma](https://www.prisma.io/) (PostgreSQL)              |
| Cache / queues       | `@fastify/redis` (ioredis)                                 |
| Graceful shutdown    | `close-with-grace`                                         |
| Logging              | Pino (pretty in dev, JSON in prod)                         |

## Architecture

Hybrid: technical layers for infrastructure (`plugins/`) + feature-first
vertical slices for business logic (`modules/`). Three `@fastify/autoload`
passes wire everything together in `src/app.ts`.

## Folder layout

```
src/
├── app.ts                     # composer + global error handler + 404
├── server.ts                  # standalone entry + close-with-grace
├── lib/
│   └── errors.ts              # custom error classes (@fastify/error)
├── plugins/
│   ├── external/              # third-party plugins (autoloaded)
│   │   ├── env.ts             # validates & exposes fastify.config
│   │   ├── sensible.ts
│   │   ├── cookie.ts
│   │   ├── cors.ts
│   │   ├── helmet.ts
│   │   ├── rate-limit.ts
│   │   ├── swagger.ts         # /api/docs when SWAGGER_ENABLED=true
│   │   ├── under-pressure.ts  # GET /health/status
│   │   ├── prisma.ts          # PrismaClient singleton + onClose
│   │   └── redis.ts
│   └── app/                   # cross-cutting app plugins (autoloaded)
│       └── system/            # GET /, GET /health
└── modules/                   # business domains (autoloaded into /api/v1)
    ├── users/index.ts         # GET /api/v1/users
    ├── products/index.ts      # GET /api/v1/products
    ├── orders/index.ts        # GET /api/v1/orders
    ├── chat/index.ts          # GET /api/v1/chat
    └── payments/index.ts      # GET /api/v1/payments
```

### How modules are auto-mounted

The third autoload pass uses:

- `indexPattern: /^index\.(ts|js)$/` — only `index.ts` of each module is
  registered as a plugin. Siblings (`service.ts`, `repository.ts`,
  `schema.ts`, `types.ts`) are internal and ignored by autoload.
- `options.prefix: '/api/v1'` — all modules share this API version prefix.
- `dirNameRoutePrefix: true` — folder name becomes the URL segment
  (`modules/users/` → `/api/v1/users`).
- `autoHooks: true` + `cascadeHooks: true` — drop `_autohooks.ts` into a
  module to register `preHandler` hooks (auth, validation, ...) for every
  route in that module.

### Recommended layout per module

```
modules/<feature>/
├── index.ts          # default export = plugin, registers routes
├── routes.ts         # HTTP endpoints (imported by index.ts)
├── service.ts        # business logic / use-cases
├── repository.ts     # OPTIONAL — only when there is real value over fastify.prisma
├── schema.ts         # TypeBox schemas
├── types.ts          # DTOs / domain types
└── _autohooks.ts     # OPTIONAL — module-wide preHandlers
```

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env` and set at least:

- `DATABASE_URL` — your PostgreSQL connection string.
- `REDIS_URL` — your Redis URL.
- `COOKIE_SECRET` — at least 32 random characters.

### 3. Start dependencies (optional)

```bash
docker compose up -d
```

### 4. Generate Prisma client (Prisma 7)

Client генерируется в `src/generated/prisma/` — выполняется автоматически при
`npm install` (`postinstall`). При необходимости вручную:

```bash
npm run prisma:generate
```

### 5. Run the server

```bash
npm run dev      # tsx watch
# or
npm run build && npm start
```

By default the API listens on `http://localhost:3000`.

| URL                      | Purpose                                            |
|--------------------------| -------------------------------------------------- |
| `GET /`                  | service banner                                     |
| `GET /health`            | readiness probe (DB + Redis)                       |
| `GET /health/status`     | `@fastify/under-pressure` status route             |
| `GET /api/docs`          | Swagger UI (when `SWAGGER_ENABLED=true`)           |
| `GET /api/v1/users`      | users module (stub)                                |
| `GET /api/v1/products`   | products module (stub)                             |
| `GET /api/v1/orders`     | orders module (stub)                               |
| `GET /api/v1/chat`       | chat module (stub)                                 |
| `GET /api/v1/payments`   | payments module (stub)                             |

## Error handling

A single `setErrorHandler` in `src/app.ts` is responsible for all error
responses:

- AJV validation errors → `400` with structured `details[]`.
- Errors carrying a `statusCode` → that status code is preserved.
- 5xx in non-development → message is masked to `Internal Server Error`.
- Every error is logged with the full request context (Pino `err` serializer).

The 404 handler is rate-limited (3 requests / 500 ms) to make URL probing
harder, mirroring `fastify/demo`.

Domain code should throw the typed errors from `src/lib/errors.ts`
(`NotFoundError`, `ConflictError`, ...) or use `@fastify/sensible` helpers
(`reply.notFound()`, `reply.unauthorized()`, ...).

## Notes for production

- Swagger UI is off unless `SWAGGER_ENABLED=true` (default `false` in `env.ts`).
- `NODE_ENV=production` masks 5xx error messages in the global error handler.
- Pino emits structured JSON when `stdout` is not a TTY.
- `trustProxy: true` — adjust if you sit behind a known set of proxies.
- Swap `prisma:migrate` (dev) for `prisma:deploy` (CI/CD).
