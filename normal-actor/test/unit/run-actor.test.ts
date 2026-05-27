import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Actor } from 'apify';
import { setTimeout } from 'node:timers/promises';
import { runNormal } from '../../src/run-actor.js';

const { booksPushData } = vi.hoisted(() => ({
    booksPushData: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('apify', () => ({
    Actor: {
        setStatusMessage: vi.fn().mockResolvedValue(undefined),
        pushData: vi.fn().mockResolvedValue(undefined),
        openDataset: vi.fn().mockResolvedValue({ pushData: booksPushData }),
        setValue: vi.fn().mockResolvedValue(undefined),
        exit: vi.fn().mockResolvedValue(undefined),
    },
    log: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warning: vi.fn(),
    },
}));

vi.mock('node:timers/promises', () => ({
    setTimeout: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('runNormal', () => {
    describe('sum dataset (default)', () => {
        it('pushes a nested item with sum, fibonacci, factorials, and a primality flag', async () => {
            await runNormal({ firstNumber: 2, secondNumber: 3, waitSeconds: 0 });

            expect(Actor.pushData).toHaveBeenCalledOnce();
            const pushed = vi.mocked(Actor.pushData).mock.calls[0][0] as Record<string, unknown>;
            expect(pushed).toEqual({
                firstNumber: 2,
                secondNumber: 3,
                sum: 5,
                math: {
                    fibonacci: [0, 1, 1, 2, 3],
                    factorial: { first: 2, second: 6 },
                },
                isSumPrime: true,
            });
        });
    });

    describe('books dataset (aliased)', () => {
        it('opens the books dataset by alias and pushes the fixture', async () => {
            await runNormal({ firstNumber: 2, secondNumber: 3, waitSeconds: 0 });

            expect(Actor.openDataset).toHaveBeenCalledExactlyOnceWith({ alias: 'books' });
            expect(booksPushData).toHaveBeenCalledExactlyOnceWith(expect.any(Array));

            const pushed = booksPushData.mock.calls[0][0] as Array<Record<string, unknown>>;
            expect(pushed).toHaveLength(3);
            // Verify the diverse-type shape that the storage integration tests rely on.
            expect(pushed[0]).toMatchObject({
                title: expect.any(String),
                author: expect.any(String),
                pages: expect.any(Number),
                rating: expect.any(Number),
                inStock: expect.any(Boolean),
                scrapedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
                tags: expect.any(Array),
                publication: {
                    year: expect.any(Number),
                    publisher: { name: expect.any(String), city: expect.any(String) },
                },
                reviews: expect.arrayContaining([
                    expect.objectContaining({ quote: expect.any(String), source: expect.any(String) }),
                ]),
                '#_internal': { sourceUrl: expect.any(String), runId: expect.any(String) },
            });
        });
    });

    describe('heterogeneous reviews across books', () => {
        it('has reviews where rating and reviewer appear on only some entries', async () => {
            await runNormal({ firstNumber: 2, secondNumber: 3, waitSeconds: 0 });

            const books = booksPushData.mock.calls[0][0] as Array<{ reviews: Record<string, unknown>[] }>;
            const allReviews = books.flatMap((b) => b.reviews);

            expect(allReviews.some((r) => r.rating !== undefined)).toBe(true);
            expect(allReviews.some((r) => r.rating === undefined)).toBe(true);
            expect(allReviews.some((r) => r.reviewer !== undefined)).toBe(true);
            expect(allReviews.some((r) => r.reviewer === undefined)).toBe(true);
        });
    });

    describe('key-value store records', () => {
        it('writes RESULT and STATS as JSON on every run', async () => {
            await runNormal({ firstNumber: 2, secondNumber: 3, waitSeconds: 0 });

            expect(Actor.setValue).toHaveBeenCalledWith('RESULT', { sum: 5 });
            expect(Actor.setValue).toHaveBeenCalledWith('STATS', expect.objectContaining({
                bookCount: 3,
                totalRating: expect.any(Number),
                averageRating: expect.any(Number),
            }));
        });

        it('writes LOG as text/plain', async () => {
            await runNormal({ firstNumber: 2, secondNumber: 3, waitSeconds: 0 });

            expect(Actor.setValue).toHaveBeenCalledWith(
                'LOG',
                expect.stringContaining('Scrape finished'),
                { contentType: 'text/plain' },
            );
        });

        it('writes COVER as a binary image/png buffer', async () => {
            await runNormal({ firstNumber: 2, secondNumber: 3, waitSeconds: 0 });

            expect(Actor.setValue).toHaveBeenCalledWith('COVER', expect.any(Buffer), {
                contentType: 'image/png',
            });
        });
    });

    describe('maxBooks', () => {
        it('slices the books fixture when maxBooks is set', async () => {
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 0, maxBooks: 2 });

            const pushed = booksPushData.mock.calls[0][0] as unknown[];
            expect(pushed).toHaveLength(2);
            expect(Actor.setValue).toHaveBeenCalledWith('STATS', expect.objectContaining({ bookCount: 2 }));
        });

        it('pushes a single book when maxBooks is 1 and computes its averageRating', async () => {
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 0, maxBooks: 1 });

            const pushed = booksPushData.mock.calls[0][0] as unknown[];
            expect(pushed).toHaveLength(1);
            expect(Actor.setValue).toHaveBeenCalledWith(
                'STATS',
                expect.objectContaining({
                    bookCount: 1,
                    totalRating: expect.any(Number),
                    averageRating: expect.any(Number),
                }),
            );
        });

        it('caps at fixture length when maxBooks exceeds it', async () => {
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 0, maxBooks: 999 });

            const pushed = booksPushData.mock.calls[0][0] as unknown[];
            expect(pushed).toHaveLength(3);
        });
    });

    describe('status and exit lifecycle', () => {
        it('sets the "Processing" status message before computing', async () => {
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 0 });
            expect(Actor.setStatusMessage).toHaveBeenCalledExactlyOnceWith('Processing');
        });

        it('calls exit with the success message at the end', async () => {
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 0 });
            expect(Actor.exit).toHaveBeenCalledExactlyOnceWith('Successfully completed');
        });
    });

    describe('delay behaviour', () => {
        function trackCallOrder(): string[] {
            const order: string[] = [];
            const record = (label: string) => async () => {
                order.push(label);
                return undefined as never;
            };
            vi.mocked(Actor.setStatusMessage).mockImplementation(record('status'));
            vi.mocked(setTimeout).mockImplementation(record('sleep'));
            vi.mocked(Actor.pushData).mockImplementation(record('push'));
            vi.mocked(Actor.exit).mockImplementation(record('exit'));
            return order;
        }

        it('does not sleep when delay is 0', async () => {
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 0 });
            expect(setTimeout).not.toHaveBeenCalled();
        });

        it('sleeps for waitSeconds when delay > 0', async () => {
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 5 });
            expect(setTimeout).toHaveBeenCalledExactlyOnceWith(5000);
        });

        it('sleeps before pushing data', async () => {
            const order = trackCallOrder();
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 2 });
            expect(order).toEqual(['status', 'sleep', 'push', 'exit']);
        });

        it('skips the sleep step but keeps other order when delay=0', async () => {
            const order = trackCallOrder();
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 0 });
            expect(order).toEqual(['status', 'push', 'exit']);
        });
    });
});
