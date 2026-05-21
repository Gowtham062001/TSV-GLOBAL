import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.any(),
  excerpt: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
});

export const serviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  order: z.number().default(0),
  status: z.string().default("PUBLISHED"),
});

export const caseStudySchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  client: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  challenge: z.string().nullable().optional(),
  solution: z.string().nullable().optional(),
  result: z.string().nullable().optional(),
  status: z.string().default("PUBLISHED"),
});

export const pageSectionUpdateSchema = z.object({
  sections: z.array(z.object({
    id: z.string(),
    isVisible: z.boolean(),
    order: z.number(),
    content: z.any(),
  }))
});
