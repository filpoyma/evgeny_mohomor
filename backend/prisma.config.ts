import 'dotenv/config'
import { defineConfig } from 'prisma/config'

/**
 * DATABASE_URL is required at runtime (Fastify) and for migrate/studio.
 * Fallback allows `prisma generate` / postinstall when .env is not present yet.
 */
const databaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://localhost:5432/goldzen?schema=public'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts'
  },
  datasource: {
    url: databaseUrl
  }
})
