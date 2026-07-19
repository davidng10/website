import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const thoughts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/thoughts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    published: z.coerce.date(),
    readingTime: z.string().default("1 min read"),
    draft: z.boolean().default(false),
  }),
});

export const collections = { thoughts };
