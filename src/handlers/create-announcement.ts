import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import securejson from 'secure-json-parse';
import z from 'zod';
import { db } from '../shared/postgres.js';
import { announcementTable, announcementToCategoryTable } from '../shared/schema.js';

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

  // TODO: Check that categoryIds exist
  const announcement = await db.transaction(async (tx) => {
    const [announcement] = await tx
      .insert(announcementTable)
      .values({
        title: body.title,
        content: body.content,
        publicationDate: body.publicationDate,
      })
      .returning({
        id: announcementTable.id,
      });

    await tx.insert(announcementToCategoryTable).values(
      body.categoryIds.map((categoryId) => ({
        announcementId: announcement!.id,
        categoryId,
      })),
    );

    return announcement!;
  });

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: announcement.id,
    }),
  };
};

const bodySchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(4000),
  publicationDate: z.iso.datetime({ offset: true }).transform((val) => new Date(val)),
  categoryIds: z.array(z.int().positive()).min(1).max(10),
});
