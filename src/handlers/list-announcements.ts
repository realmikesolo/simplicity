import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { asc, count, desc } from 'drizzle-orm';
import z from 'zod';
import { db } from '../shared/postgres.js';
import { announcementTable } from '../shared/schema.js';

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
  const offset = (query.page - 1) * query.limit;

  const [announcements, [countRecord]] = await Promise.all([
    db.query.announcementTable.findMany({
      orderBy: query.sort === 'asc' ? asc(announcementTable.updatedAt) : desc(announcementTable.updatedAt),
      limit: query.limit,
      offset,
      with: {
        categories: {
          columns: {},
          with: {
            category: true,
          },
        },
      },
    }),
    db.select({ count: count() }).from(announcementTable),
  ]);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: announcements.map((announcement) => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        publicationDate: announcement.publicationDate,
        updatedAt: announcement.updatedAt,
        categories: announcement.categories.map(({ category }) => ({
          id: category.id,
          name: category.name,
        })),
      })),
      total: countRecord!.count,
    }),
  };
};

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000),
  limit: z.coerce.number().int().min(1).max(100),
  sort: z.enum(['asc', 'desc']),
});
