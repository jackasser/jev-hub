import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { entrySchema } from './lib/schema';

export const collections = {
  entries: defineCollection({
    loader: file('src/data/entries.json'),
    schema: entrySchema,
  }),
};
