# Architecture

Бэкенд Goldzen на **Fastify 5** + **TypeScript**. Скелет построен по гибриду:
инфраструктура через плагины (`plugins/`) + бизнес-домены через feature-first
модули (`modules/`). Основа — [official `fastify/demo`](https://github.com/fastify/demo).

**Статус:** skeleton. Бизнес-логика из `goldZenServer` (Express) ещё не перенесена.
Модули `users`, `products`, `orders`, `chat`, `payments` — заглушки.

## Стек

| Concern | Tool |
|---------|------|
| HTTP | [Fastify 5](https://fastify.dev) |
| Plugin loader | `@fastify/autoload` |
| Config | `@fastify/env` (JSON Schema → `fastify.config`) |
| Validation / types | `@fastify/type-provider-typebox` + `@sinclair/typebox` |
| Errors | `@fastify/error` (`src/lib/errors.ts`) + `@fastify/sensible` |
| Security | `@fastify/helmet`, `@fastify/cors`, `@fastify/rate-limit`, `@fastify/cookie` |
| Health | `GET /health` (`plugins/app/system/`), `GET /health/status` (`under-pressure`) |
| Docs | `@fastify/swagger` + UI на `/api/docs` при `SWAGGER_ENABLED=true` |
| ORM | Prisma + PostgreSQL |
| Cache | `@fastify/redis` (ioredis) |
| Logging | Pino (pretty в TTY, JSON в prod) |
| Shutdown | `close-with-grace` |

## Дерево каталогов

```text
goldZenServerFast/
├── prisma/
│   └── schema.prisma          # PostgreSQL datasource, модели — позже
├── src/
│   ├── server.ts              # entry: Fastify instance + listen + graceful shutdown
│   ├── app.ts                 # composition root: autoload ×3 + error/404 handlers
│   ├── lib/
│   │   └── errors.ts          # типизированные HTTP-ошибки (@fastify/error)
│   ├── plugins/
│   │   ├── external/          # third-party / infra (autoload, pass 1)
│   │   └── app/               # cross-cutting app plugins (autoload, pass 2)
│   └── modules/               # business domains (autoload, pass 3 → /api/v1/*)
│       ├── users/
│       ├── products/
│       ├── orders/
│       ├── chat/
│       └── payments/
├── docker-compose.yml         # postgres:16 + redis:7
└── .env.example
```

## Три прохода autoload (`src/app.ts`)

Порядок регистрации **фиксирован** и важен:

```text
1. plugins/external/   → инфраструктура (env, prisma, redis, cors, …)
2. plugins/app/        → cross-cutting (system routes, auth — позже)
3. modules/            → бизнес-домены под префиксом /api/v1
```

### Pass 1 — `plugins/external/`

Third-party и инфраструктурные плагины. Декорируют `fastify`:

| Файл | Декоратор / эффект                                  |
|------|-----------------------------------------------------|
| `env.ts` | `fastify.config`                                    |
| `sensible.ts` | `reply.notFound()`, `httpErrors`, …                 |
| `cookie.ts` | signed cookies                                      |
| `cors.ts` | CORS из `CORS_ORIGINS`                              |
| `helmet.ts` | security headers                                    |
| `rate-limit.ts` | global rate limit                                   |
| `swagger.ts` | `/api/docs` при `SWAGGER_ENABLED=true`              |
| `under-pressure.ts` | `GET /health/status`                         |
| `prisma.ts` | `fastify.prisma` (singleton, `$disconnect` on close) |
| `redis.ts` | `fastify.redis`                                     |

Плагины, читающие `fastify.config` и идущие **алфавитно раньше** `env.ts`
(`cookie`, `cors`), обёрнуты в `fastify-plugin` с
`dependencies: ['@fastify/env']`.

Файлы с `export const autoConfig` — конфиг для autoload.
Файлы с `export default fp(...)` — кастомная регистрация.

### Pass 2 — `plugins/app/`

Cross-cutting concerns **без** префикса `/api`. Маршруты живут на корне приложения.

| Файл / папка | Маршруты |
|--------------|----------|
| `system/` (`index.ts`) | `GET /`, `GET /health` |

Сюда же добавлять: `auth.ts` (`fastify.authenticate`, `request.user`), глобальные
decorators, request-scoped hooks.

### Pass 3 — `modules/`

Бизнес-домены. Autoload-опции:

```typescript
{
  dir: 'modules',
  indexPattern: /^index\.(ts|js)$/,  // только index.ts — точка входа модуля
  dirNameRoutePrefix: true,           // users/ → /api/v1/users
  autoHooks: true,                    // _autohooks.ts в папке модуля
  cascadeHooks: true,
  options: { prefix: '/api/v1' }
}
```

**Имя папки = URL-сегмент.** Новый модуль = новая папка с `index.ts`.
В `app.ts` ничего менять не нужно.

## Соответствие Express (`goldZenServer`)

| Express | Fastify (этот проект) |
|---------|------------------------|
| `app.ts` + `server.ts` | `src/server.ts` + `src/app.ts` |
| `routes/index.ts` | autoload `modules/` + `dirNameRoutePrefix` |
| `routes/auth.routes.ts` | `modules/auth/routes.ts` |
| `controllers/auth.controller.ts` | `modules/auth/handlers.ts` |
| логика в controller | `modules/auth/service.ts` |
| Mongoose / прямой DB | `modules/*/repository.ts` (опц.) или `fastify.prisma` |
| `middleware/requireAuth` | `modules/*/_autohooks.ts` или `plugins/app/auth.ts` |
| `express-validator` | `modules/*/schema.ts` (TypeBox) + `schema` в route |
| `errorHandler` middleware | `setErrorHandler` в `src/app.ts` |
| `notFoundErrorHandler` | `setNotFoundHandler` в `src/app.ts` |

## Рекомендуемая структура модуля

Когда модуль вырастет из заглушки — разнести по файлам:

```text
modules/<feature>/
├── index.ts          # default export = FastifyPluginAsync; регистрирует routes
├── routes.ts         # HTTP-методы и пути (аналог Express router)
├── handlers.ts       # тонкие handler-функции (аналог controllers)
├── service.ts        # бизнес-логика / use-cases
├── schema.ts         # TypeBox: body, params, query, response
├── types.ts          # DTO, domain types
├── repository.ts     # ОПЦИОНАЛЬНО — только при нетривиальном доступе к данным
└── _autohooks.ts     # ОПЦИОНАЛЬНО — preHandler для всего модуля (auth, …)
```

### Роли файлов

| Файл | Ответственность |
|------|-----------------|
| `index.ts` | Единственный файл, который autoload регистрирует как плагин |
| `routes.ts` | `fastify.get/post/...` + привязка schema и handler |
| `handlers.ts` | `(request, reply) => …`; вызывает service, не содержит бизнес-логику |
| `service.ts` | Use-cases; принимает deps (prisma, redis) явно или через `fastify` |
| `schema.ts` | TypeBox-схемы для валидации и OpenAPI |
| `repository.ts` | Prisma-запросы — **только если** есть смысл поверх `fastify.prisma.*` |
| `_autohooks.ts` | Hooks модуля; autoload подхватит автоматически |

### Пример каркаса

```typescript
// modules/users/index.ts
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { usersRoutes } from './routes.ts'

const users: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.register(usersRoutes)
}

export default users
```

```typescript
// modules/users/routes.ts
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import * as handlers from './handlers.ts'
import * as schema from './schema.ts'

export const usersRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', { schema: schema.listUsersSchema }, handlers.listUsers)
  fastify.get('/:id', { schema: schema.getUserSchema }, handlers.getUser)
}
```

```typescript
// modules/users/handlers.ts
import type { FastifyRequest, FastifyReply } from 'fastify'
import { createUsersService } from './service.ts'
import { NotFoundError } from '../../lib/errors.ts'

export async function getUser(
  request: FastifyRequest<{ Params: { id: string } }>,
  _reply: FastifyReply
) {
  const service = createUsersService(request.server)
  const user = await service.getById(request.params.id)
  if (!user) throw new NotFoundError('User')
  return user
}
```

Autoload смонтирует это на **`GET /api/v1/users/:id`**.

## Правила между модулями

**Разрешено:**

- модуль → `fastify.prisma`, `fastify.redis`, `fastify.config`
- модуль → `src/lib/errors.ts`, `src/shared/*` (когда появится)
- модуль → decorators из `plugins/app/` (`fastify.authenticate`)

**Запрещено:**

- прямой import `service.ts` / `repository.ts` **другого** модуля
- cross-module бизнес-логика через import — только через events, queues или
  shared decorator, зарегистрированный в `plugins/app/`

**`repository.ts` — не обязателен.** Для thin CRUD достаточно
`service.ts` + `fastify.prisma.<model>`. Repository — когда есть кэш в Redis,
несколько источников данных или сложные запросы.

**`shared/`** — только код, переиспользуемый **≥3 модулями**. Иначе — внутри
своего модуля.

## Error handling

Единая точка — `setErrorHandler` в `src/app.ts`:

| Случай | HTTP | Тело |
|--------|------|------|
| AJV validation (`err.validation`) | 400 | `{ statusCode, code, error, message, details[] }` |
| `@fastify/error` / `statusCode < 500` | as-is | message открыт |
| 5xx в production | 500 | message = `Internal Server Error` |
| 5xx в development | 500 | реальный message |

404 — `setNotFoundHandler` с rate limit (3 req / 500 ms), паттерн из `fastify/demo`.

В доменном коде:

```typescript
import { NotFoundError, ConflictError } from '../lib/errors.ts'
// или
return reply.notFound('User not found')  // @fastify/sensible
```

## Текущие эндпоинты (skeleton)

| Method | URL                  | Источник                         |
|--------|----------------------|----------------------------------|
| GET | `/`                  | `plugins/app/system/`            |
| GET | `/health`            | readiness: prisma + redis        |
| GET | `/health/status`     | `plugins/external/under-pressure` |
| GET | `/api/docs`          | swagger (`SWAGGER_ENABLED=true`) |
| GET | `/api/v1/users`      | stub                             |
| GET | `/api/v1/products`   | stub                             |
| GET | `/api/v1/orders`     | stub                             |
| GET | `/api/v1/chat`       | stub                             |
| GET | `/api/v1/payments`   | stub                             |

## Соглашения в коде

1. **ESM** — `"type": "module"`, imports с расширением `.js` в compiled output
   (в source TypeScript: `./routes.ts`, `./app.js` из `server.ts` после tsc).
2. **TypeBox** для route schemas — `@fastify/type-provider-typebox`.
3. **Конфиг только через env** — `@fastify/env`, без JSON/YAML config files.
4. **Не проверять `NODE_ENV` для фич** — использовать явные env-флаги в
   `fastify.config` (пример: Swagger включается только при `SWAGGER_ENABLED=true`).
5. **`fastify-plugin` (`fp`)** — когда decorator/hook/error handler должен
   быть виден родительскому scope (system routes, prisma, auth).
6. **Controllers = handlers** — имя `handlers.ts` предпочтительнее `controllers.ts`,
   но допустимо оба; главное — не смешивать с `routes.ts` и `service.ts`.

## Entry points

| Файл | Роль |
|------|------|
| `src/server.ts` | Создаёт Fastify, регистрирует `app.ts` через `fp`, `listen`, SIGTERM/SIGINT |
| `src/app.ts` | Composition root: autoload ×3, global error/404 handlers |

`server.ts` не содержит бизнес-маршрутов — только bootstrap.

## Prisma (v7)

- Schema: `prisma/schema.prisma` — модели и `generator client` (`provider = "prisma-client"`).
- Config: `prisma.config.ts` — `DATABASE_URL`, путь к migrations (URL **не** в schema).
- Client: генерируется в `src/generated/prisma/`, импорт из `generated/prisma/client`.
- Runtime: `@prisma/adapter-pg` + `pg` — singleton в `plugins/external/prisma.ts`.
- CLI: `dotenv` подгружает `.env` для `prisma migrate` / `prisma studio`.
- Generate: `npm run prisma:generate` или автоматически через `postinstall`.
- Миграции: `npm run prisma:migrate` (dev), `npm run prisma:deploy` (CI/prod).
- `src/generated/` в `.gitignore` — client пересоздаётся при install/generate.

## Что добавлять дальше (перенос из Express)

1. **`plugins/app/auth.ts`** — JWT/session, `fastify.authenticate`, `request.user`.
2. **Модули по доменам** — например `modules/auth/` (login/register/refresh/me)
   вместо или вместе с `modules/users/`.
3. **`prisma/schema.prisma`** — модели User, Product, Order, …
4. **`shared/`** — utils/constants только при реальном переиспользовании.
5. **Тесты** — `app.inject()` per module; см. fastify testing docs.

## Связанные документы

- [README.md](./README.md) — getting started, env, docker
- [src/modules/README.md](./src/modules/README.md) — кратко про modules
- [src/plugins/README.md](./src/plugins/README.md) — external vs app plugins
