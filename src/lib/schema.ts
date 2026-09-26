import { z } from 'astro/zod';
import { CATEGORIES } from './taxonomy';

/** http(s) only: `javascript:` / `data:` / `ftp:` never become links (R-08). */
const httpUrl = z.url().refine((v) => /^https?:\/\//i.test(v), 'only http(s) URLs are allowed');
/** Embedded media must be https so it loads on the https site (R-11). */
const httpsUrl = z.url().refine((v) => /^https:\/\//i.test(v), 'only https URLs are allowed');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

export const entrySchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'id must be a lowercase slug'),
    name: z.string().min(2),
    url: httpUrl,
    repoUrl: httpUrl.optional(),
    category: z.enum(CATEGORIES),
    tags: z.array(z.string().min(1)).default([]),
    org: z.string().min(1),
    region: z.string().min(1).optional(),
    license: z.string().min(1).optional(),
    language: z.string().min(1).optional(),
    date: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'expected YYYY, YYYY-MM or YYYY-MM-DD'),
    addedAt: isoDate,
    stars: z.number().int().nonnegative().optional(),
    starsUpdatedAt: isoDate.optional(),
    status: z.enum(['active', 'archived']).default('active'),
    official: z.boolean().default(false),
    description_en: z.string().min(60).max(600),
    description_ja: z.string().min(40).max(600),
    image: httpsUrl.optional(),
    imageCredit: z.string().min(1).optional(),
    featured: z.boolean().default(false),
    sourceRefs: z.array(httpUrl).min(1),
  })
  .strict()
  .refine((e) => e.stars === undefined || Boolean(e.repoUrl), {
    message: 'stars require a repoUrl',
    path: ['stars'],
  })
  .refine((e) => !e.image || Boolean(e.imageCredit), {
    message: 'imageCredit is required when image is set',
    path: ['imageCredit'],
  });

export type Entry = z.infer<typeof entrySchema>;
export type EntryInput = z.input<typeof entrySchema>;
