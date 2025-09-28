import { drizzle } from 'drizzle-orm/aws-data-api/pg';
import { Env } from './env.js';

export const db = drizzle({
  connection: {
    database: 'postgres',
    secretArn: Env.AURORA_POSTGRESQL_CLUSTER_SECRET_ARN,
    resourceArn: Env.AURORA_POSTGRESQL_CLUSTER_ARN,
  },
});
