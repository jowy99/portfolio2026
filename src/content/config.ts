import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      cover: z.union([z.string().min(1), image()]),
      date: z.coerce.date(),
      featured: z.boolean().default(false),
      stack: z.array(z.string().min(1)).nonempty(),
      links: z.object({
        live: z.string().url().optional(),
        github: z.string().url().optional(),
      }).default({}),
      role: z.string().optional(),
      impact: z.array(z.string()).optional(),
    }),
});

export const collections = {
  projects,
};
