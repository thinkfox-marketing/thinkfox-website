import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const seo = z
  .object({
    titel: z.string().optional(),
    beschreibung: z.string().optional(),
    fokusKeyword: z.string().optional(),
    lesedauer: z.string().optional(),
  })
  .default({});

const common = {
  title: z.string(),
  date: z.coerce.date(),
  modified: z.coerce.date().optional(),
  kategorien: z.array(z.string()).default([]),
  schlagworte: z.array(z.string()).default([]),
  bild: z.string().optional(),
  bildAlt: z.string().default(''),
  auszug: z.string().default(''),
  seo,
  entwurf: z.boolean().default(false),
  // Nur importierte WordPress-Beiträge: Originalinhalt liegt in src/legacy/posts/<slug>.html
  wpId: z.number().optional(),
  template: z.string().optional(),
  legacy: z.boolean().default(false),
};

const medium = z.discriminatedUnion('typ', [
  z.object({ typ: z.literal('bild'), bild: z.string(), alt: z.string().default('') }),
  z.object({ typ: z.literal('video'), youtube: z.string() }),
  z.object({ typ: z.literal('galerie'), bilder: z.array(z.object({ bild: z.string(), alt: z.string().default('') })) }),
]);

const projekte = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projekte' }),
  schema: z.object({
    ...common,
    kunde: z.string().optional(),
    veroeffentlichung: z.string().optional(),
    leistungen: z.array(z.string()).default([]),
    projektLink: z.object({ text: z.string(), url: z.string() }).optional(),
    medien: z.array(medium).default([]),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    ...common,
    faq: z
      .object({
        titel: z.string().default(''),
        fragen: z.array(z.object({ frage: z.string(), antwort: z.string() })).default([]),
      })
      .optional(),
    cta: z
      .object({
        text: z.string(),
        button: z.string(),
        link: z.string(),
      })
      .optional(),
  }),
});

// Kundenlogos im Header-Bereich der Startseite (Referenzen)
const referenzen = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/referenzen' }),
  schema: z.object({
    name: z.string(),
    logo: z.string(),
    link: z.string().optional(),
    reihenfolge: z.number().default(0),
  }),
});

export const collections = { projekte, blog, referenzen };
