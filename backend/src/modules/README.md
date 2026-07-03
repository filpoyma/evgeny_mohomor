# Modules

Each subfolder is a self-contained business domain (vertical slice).
Autoloaded by `@fastify/autoload` from `app.ts`:

- mounted under `/api/v1/<dir-name>` (`options.prefix` + `dirNameRoutePrefix`)
- only the file matching `indexPattern` (`/^index\.(ts|js)$/`) is registered
  as a plugin — siblings (`service.ts`, `repository.ts`, `schema.ts`,
  `types.ts`) are internal implementation details and won't be picked up
- `_autohooks.ts` (if present) registers preHandlers that apply to every
  route in the module (and its descendants, thanks to `cascadeHooks`)

## Recommended layout per module

```
modules/<feature>/
├── index.ts          # default export = FastifyPluginAsync, registers routes
├── routes.ts         # HTTP endpoints (imported by index.ts)
├── service.ts        # business logic / use-cases
├── repository.ts     # Prisma access — only when there is real value
├── schema.ts         # TypeBox schemas for validation & response
├── types.ts          # DTOs, domain types
└── _autohooks.ts     # OPTIONAL: hooks for the whole module (e.g. requireAuth)
```

`repository.ts` is **optional** — drop it if the module is a thin CRUD wrapper
around `fastify.prisma.<model>.*`. Add it when there is non-trivial data
access (multiple sources, caching layer, complex joins).

## Cross-module rules

- Modules **must not** import each other's `repository.ts` / `service.ts`
  directly. Cross-module communication goes through public events, queues,
  or a shared service registered as a Fastify decorator.
- Anything reused by ≥3 modules belongs in `src/shared/`.
