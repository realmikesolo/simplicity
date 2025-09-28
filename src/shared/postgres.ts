import { drizzle } from 'drizzle-orm/aws-data-api/pg';
import { Env } from './env.js';
import * as schema from './schema.js';

export const db = drizzle({
  connection: {
    database: Env.DATABASE_NAME,
    secretArn: Env.AURORA_POSTGRESQL_CLUSTER_SECRET_ARN,
    resourceArn: Env.AURORA_POSTGRESQL_CLUSTER_ARN,
  },
  schema,
});
