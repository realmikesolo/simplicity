import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { asc, gt } from 'drizzle-orm';
import z from 'zod';
import { db } from '../shared/postgres.js';
import { categoryTable } from '../shared/schema.js';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const queryParsed = querySchema.safeParse(event.queryStringParameters!);
  if (!queryParsed.success) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Invalid request query params' }),
    };
  }

  const query = queryParsed.data;

  const categories = await db
    .select()
    .from(categoryTable)
    .where(query.cursor ? gt(categoryTable.id, query.cursor) : undefined)
    .limit(query.limit)
    .orderBy(asc(categoryTable.id));

  const lastCategory = categories.at(-1);

  return {
    statusCode: 200,
    body: JSON.stringify({
      categories,
      nextCursor: lastCategory ? lastCategory.id : undefined,
    }),
  };
};

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100),
  cursor: z.coerce.number().int().positive().optional(),
});
