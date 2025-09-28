import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import securejson from 'secure-json-parse';
import z from 'zod';
import { db } from '../shared/postgres.js';
import { categoryTable } from '../shared/schema.js';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Missing request body' }),
    };
  }

  const bodyParsed = bodySchema.safeParse(securejson.parse(event.body));
  if (!bodyParsed.success) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Invalid request body' }),
    };
  }

  const body = bodyParsed.data;

  // TODO: handle unique violation error
  const [category] = await db
    .insert(categoryTable)
    .values({
      name: body.name,
    })
    .returning({
      id: categoryTable.id,
    });

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: category!.id,
    }),
  };
};

const bodySchema = z.object({
  name: z.string().min(1).max(100),
});
