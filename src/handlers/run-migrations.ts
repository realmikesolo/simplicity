import type { Handler } from 'aws-lambda';
import { migrate } from 'drizzle-orm/aws-data-api/pg/migrator';
import { db } from '../shared/postgres.js';

export const handler: Handler = async () => {
  await migrate(db, {
    migrationsFolder: 'migrations',
  });

  return {
    message: 'ok',
  };
};
