import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { eq } from 'drizzle-orm';
import z from 'zod';
import { db } from '../shared/postgres.js';
import { announcementTable } from '../shared/schema.js';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const pathParsed = pathSchema.safeParse(event.pathParameters!);
  if (!pathParsed.success) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Invalid request path params' }),
    };
  }

  const path = pathParsed.data;

  await db.delete(announcementTable).where(eq(announcementTable.id, path.id));

  return {
    statusCode: 204,
  };
};

const pathSchema = z.object({
  id: z.coerce.number().int().positive(),
});
