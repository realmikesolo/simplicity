import { z } from 'zod';

export const Env = z
  .object({
    AURORA_POSTGRESQL_CLUSTER_SECRET_ARN: z.string().nonempty(),
    AURORA_POSTGRESQL_CLUSTER_ARN: z.string().nonempty(),
    DATABASE_NAME: z.string().nonempty(),
  })
  .parse(process.env);
