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

  const announcement = await db.query.announcementTable.findFirst({
    where: eq(announcementTable.id, path.id),
    with: {
      categories: {
        columns: {},
        with: {
          category: true,
        },
      },
    },
  });

  if (!announcement) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Announcement not found' }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      publicationDate: announcement.publicationDate,
      updatedAt: announcement.updatedAt,
      categories: announcement.categories.map(({ category }) => ({
        id: category.id,
        name: category.name,
      })),
    }),
  };
};

const pathSchema = z.object({
  id: z.coerce.number().int().positive(),
});
