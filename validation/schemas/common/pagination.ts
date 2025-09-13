import {z} from "zod";

export const PaginationSchema = z.object({
     
        totalItems: z.number(),
        totalPages: z.number(),
        currentPage: z.number(),
        pageSize: z.number(),
        hasNext: z.boolean(),
        hasPrevious: z.boolean(),
        nextPage: z.number().nullable(),
        previousPage: z.number().nullable(),
    
})


export type Pagination = z.infer<typeof PaginationSchema>;