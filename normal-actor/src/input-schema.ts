import * as z from 'zod';

export const inputSchema = z.object({
    firstNumber: z.number().int().describe('First number to add'),
    secondNumber: z.number().int().describe('Second number to add'),
    waitSeconds: z.number().int().min(0).default(0).describe('Seconds to wait before computing the sum'),
    includeBookFixture: z.boolean().default(false)
        .describe('If true, push the Apify book fixture (3 nested items) to the default dataset instead of the sum, and write RESULT + STATS records to the default key-value store.'),
});

export type Input = z.infer<typeof inputSchema>;
