import { setTimeout } from 'node:timers/promises';

import { Actor, log } from 'apify';

import type { Input } from './input-schema.js';

/**
 * Fictional Apify book fixture used by MCP server integration tests. Each item has a 3-level nested
 * `publication.publisher.city` path used to verify that the storage tools recurse correctly through
 * dot-prefixed field selectors.
 */
interface ApifyBook {
    title: string;
    author: { name: string; country: string };
    publication: { year: number; publisher: { name: string; city: string } };
    tags: string[];
    rating: number;
}

const APIFY_BOOK_FIXTURE: ApifyBook[] = [
    {
        title: 'async/await and Other Lies I Told My Scraper',
        author: { name: 'Nadia "node_modules" Petrov', country: 'BG' },
        publication: { year: 2025, publisher: { name: 'Apify Press', city: 'Prague' } },
        tags: ['agentic', 'noir', 'callback-hell'],
        rating: 4.2,
    },
    {
        title: 'undefined is not a Function: A Love Story',
        author: { name: 'Sir Crawls-a-Lot', country: 'UK' },
        publication: { year: 2024, publisher: { name: 'Headless House', city: 'San Francisco' } },
        tags: ['romance', 'typescript', 'tragedy'],
        rating: 4.7,
    },
    {
        title: 'It Works on My Machine — and Other Crime Scenes',
        author: { name: 'BOT-7', country: 'CLOUD' },
        publication: { year: 2025, publisher: { name: 'Event Loop Editions', city: 'Berlin' } },
        tags: ['thriller', 'devops', 'rate-limited'],
        rating: 4.9,
    },
];

export async function runNormal({ firstNumber, secondNumber, waitSeconds, includeBookFixture }: Input): Promise<void> {
    await Actor.setStatusMessage('Processing');

    if (waitSeconds > 0) {
        log.info(`Waiting ${waitSeconds}s before computing sum`);
        await setTimeout(waitSeconds * 1000);
    }

    const sum = firstNumber + secondNumber;
    log.info('Computed sum', { firstNumber, secondNumber, sum });

    if (includeBookFixture) {
        await runBookFixture(sum);
    } else {
        await Actor.pushData({ firstNumber, secondNumber, sum });
    }

    await Actor.exit('Successfully completed');
}

async function runBookFixture(sum: number): Promise<void> {
    log.info('Pushing Apify book fixture', { count: APIFY_BOOK_FIXTURE.length });
    await Actor.pushData(APIFY_BOOK_FIXTURE);

    const totalRating = APIFY_BOOK_FIXTURE.reduce((acc, b) => acc + b.rating, 0);
    await Actor.setValue('RESULT', { sum });
    await Actor.setValue('STATS', {
        bookCount: APIFY_BOOK_FIXTURE.length,
        totalRating,
        averageRating: totalRating / APIFY_BOOK_FIXTURE.length,
    });
}
