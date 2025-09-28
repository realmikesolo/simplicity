import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/shared/schema.ts',
  out: './src/drizzle/migrations',
});
