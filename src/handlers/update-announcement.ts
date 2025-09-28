import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { and, eq, inArray } from 'drizzle-orm';
import securejson from 'secure-json-parse';
import z from 'zod';
import { db } from '../shared/postgres.js';
import { announcementTable, announcementToCategoryTable } from '../shared/schema.js';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const pathParsed = pathSchema.safeParse(event.pathParameters!);
  if (!pathParsed.success) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Invalid request path params' }),
    };
  }

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

  const path = pathParsed.data;
  const body = bodyParsed.data;

  const updated = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: announcementTable.id })
      .from(announcementTable)
      .where(eq(announcementTable.id, path.id))
      .limit(1);

    if (!existing) {
      return null;
    }

    const toUpdate: Partial<{
      title: string;
      content: string;
      publicationDate: Date;
    }> = {};

    if (body.title !== undefined) {
      toUpdate.title = body.title;
    }
    if (body.content !== undefined) {
      toUpdate.content = body.content;
    }
    if (body.publicationDate !== undefined) {
      toUpdate.publicationDate = body.publicationDate;
    }

    if (Object.keys(toUpdate).length > 0) {
      await tx.update(announcementTable).set(toUpdate).where(eq(announcementTable.id, path.id));
    }

    if (body.addCategoryIds) {
      await tx
        .insert(announcementToCategoryTable)
        .values(body.addCategoryIds.map((categoryId) => ({ announcementId: path.id, categoryId })))
        .onConflictDoNothing();
    }

    if (body.removeCategoryIds) {
      await tx
        .delete(announcementToCategoryTable)
        .where(
          and(
            eq(announcementToCategoryTable.announcementId, path.id),
            inArray(announcementToCategoryTable.categoryId, body.removeCategoryIds),
          ),
        );
    }

    return { id: path.id };
  });

  if (!updated) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Announcement not found' }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  };
};

const pathSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).max(4000).optional(),
  publicationDate: z.iso
    .datetime({ offset: true })
    .transform((val) => new Date(val))
    .optional(),
  addCategoryIds: z.array(z.int().positive()).min(1).max(10).optional(),
  removeCategoryIds: z.array(z.int().positive()).min(1).max(10).optional(),
});
