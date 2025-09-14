import { z } from "zod";

export const paginationLink = z.object({
  url: z.string().nullable(),
  label: z.string(),
  active: z.boolean(),
});

export const makePaginationMeta = (itemSchema: z.ZodTypeAny) =>
  z.object({
    current_page: z.number(),
    data: z.array(itemSchema),
    first_page_url: z.string(),
    from: z.number().nullable(),
    last_page: z.number(),
    last_page_url: z.string(),
    links: z.array(paginationLink),
    next_page_url: z.string().nullable(),
    path: z.string(),
    per_page: z.number(),
    prev_page_url: z.string().nullable(),
    to: z.number().nullable(),
    total: z.number(),
  });

export type PaginationLink = z.infer<typeof paginationLink>;
