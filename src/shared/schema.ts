import { relations } from 'drizzle-orm';
import { integer, pgTable, primaryKey, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const announcementTable = pgTable('announcements', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull(),
  publicationDate: timestamp('publication_date', { withTimezone: true, precision: 3 }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, precision: 3 }).$onUpdate(() => new Date()),
});

export const announcementTableRelations = relations(announcementTable, ({ many }) => ({
  categories: many(announcementToCategoryTable),
}));

export const categoryTable = pgTable('categories', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 100 }).notNull().unique(),
});

export const categoryTableRelations = relations(categoryTable, ({ many }) => ({
  announcements: many(announcementToCategoryTable),
}));

export const announcementToCategoryTable = pgTable(
  'announcements_to_categories',
  {
    announcementId: integer('announcement_id')
      .notNull()
      .references(() => announcementTable.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categoryTable.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.announcementId, t.categoryId] })],
);

export const announcementToCategoryTableRelations = relations(announcementToCategoryTable, ({ one }) => ({
  announcement: one(announcementTable, {
    fields: [announcementToCategoryTable.announcementId],
    references: [announcementTable.id],
  }),
  category: one(categoryTable, {
    fields: [announcementToCategoryTable.categoryId],
    references: [categoryTable.id],
  }),
}));
