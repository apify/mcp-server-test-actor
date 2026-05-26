import * as z from 'zod';

export const inputSchema = z.object({
    firstNumber: z.number().int().min(0).max(10).describe('First number to add (0–10)'),
    secondNumber: z.number().int().min(0).max(10).describe('Second number to add (0–10)'),
    waitSeconds: z.number().int().min(0).default(0).describe('Seconds to wait before computing the sum'),
    maxItems: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe('Maximum number of books to scrape. Defaults to all available books.'),
});

export type Input = z.infer<typeof inputSchema>;
