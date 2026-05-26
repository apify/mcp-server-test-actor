import { setTimeout } from 'node:timers/promises';

import { Actor, log } from 'apify';

import type { Input } from './input-schema.js';

/**
 * Fictional Apify book fixture used by MCP server integration tests. Each field exercises a
 * distinct JSON shape (string, integer, float, boolean, array of primitives, array of objects,
 * 3-level nested object) so storage tools can be tested against varied paths and value types.
 */
interface ApifyBook {
    title: string;
    author: string;
    pages: number;
    rating: number;
    inStock: boolean;
    tags: string[];
    publication: { year: number; publisher: { name: string; city: string } };
    reviews: { quote: string; source: string }[];
}

const APIFY_BOOK_FIXTURE: ApifyBook[] = [
    {
        title: 'async/await and Other Lies I Told My Scraper',
        author: 'Nadia "node_modules" Petrov',
        pages: 1337,
        rating: 4.2,
        inStock: true,
        tags: ['async', 'scraping-noir', 'callback-hell'],
        publication: { year: 2025, publisher: { name: 'Apify Press', city: 'Prague' } },
        reviews: [
            { quote: 'Better than the Node.js docs. Also longer.', source: 'JavaScript Weekly' },
            { quote: 'Made me cry at the memory leak chapter.', source: 'Headless Times' },
        ],
    },
    {
        title: 'PhantomJS Has Left the Building',
        author: 'James Crawford',
        pages: 423,
        rating: 3.9,
        inStock: false,
        tags: ['headless', 'deprecated', 'last-render'],
        publication: { year: 2024, publisher: { name: 'Cheerio House', city: 'San Francisco' } },
        reviews: [
            { quote: 'Surprisingly, no robots.txt was violated in the making of this book.', source: 'Legal Weekly' },
        ],
    },
    {
        title: 'Wake. Code. Soylent. Repeat.',
        author: 'Mira Botev',
        pages: 210,
        rating: 4.7,
        inStock: true,
        tags: ['startup-grind', 'yc-noir', 'meal-replacement'],
        publication: { year: 2025, publisher: { name: 'Event Loop Press', city: 'Prague' } },
        reviews: [
            {
                quote: 'I asked my agent to summarize this book. It opened 4,000 tabs and ordered beer.',
                source: 'Prompt Quarterly',
            },
        ],
    },
];

export async function runNormal({ firstNumber, secondNumber, waitSeconds, maxItems }: Input): Promise<void> {
    await Actor.setStatusMessage('Processing');

    if (waitSeconds > 0) {
        log.info(`Waiting ${waitSeconds}s before computing sum`);
        await setTimeout(waitSeconds * 1000);
    }

    const sum = firstNumber + secondNumber;
    log.info('Computed sum', { firstNumber, secondNumber, sum });

    await Actor.pushData({ firstNumber, secondNumber, sum });

    const books = APIFY_BOOK_FIXTURE.slice(0, maxItems);
    log.info('Pushing Apify book fixture', { count: books.length });
    const booksDataset = await Actor.openDataset({ alias: 'books' });
    await booksDataset.pushData(books);

    const totalRating = books.reduce((acc, b) => acc + b.rating, 0);
    await Actor.setValue('RESULT', { sum });
    await Actor.setValue('STATS', {
        bookCount: books.length,
        totalRating,
        averageRating: books.length === 0 ? null : totalRating / books.length,
    });

    await Actor.exit('Successfully completed');
}
