import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Actor } from 'apify';
import { setTimeout } from 'node:timers/promises';
import { runNormal } from '../../src/run-actor.js';

vi.mock('apify', () => ({
    Actor: {
        setStatusMessage: vi.fn().mockResolvedValue(undefined),
        pushData: vi.fn().mockResolvedValue(undefined),
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
    // Keeping this simple as it's not the main functionality of the actor
    describe('sum computation', () => {
        it('pushes the sum of two positive integers', async () => {
            await runNormal({ firstNumber: 2, secondNumber: 3, waitSeconds: 0, includeBookFixture: false });
            expect(Actor.pushData).toHaveBeenCalledExactlyOnceWith({
                firstNumber: 2,
                secondNumber: 3,
                sum: 5,
            });
        });

        it('does not write key-value records in default mode', async () => {
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 0, includeBookFixture: false });
            expect(Actor.setValue).not.toHaveBeenCalled();
        });
    });

    describe('book fixture mode', () => {
        it('pushes the book fixture instead of the sum item', async () => {
            await runNormal({ firstNumber: 2, secondNumber: 3, waitSeconds: 0, includeBookFixture: true });

            expect(Actor.pushData).toHaveBeenCalledExactlyOnceWith(expect.any(Array));
            const pushed = vi.mocked(Actor.pushData).mock.calls[0][0] as Array<Record<string, unknown>>;
            expect(pushed).toHaveLength(3);
            // Verify the nested shape that the storage integration tests rely on.
            expect(pushed[0]).toMatchObject({
                title: expect.any(String),
                author: { name: expect.any(String), country: expect.any(String) },
                publication: {
                    year: expect.any(Number),
                    publisher: { name: expect.any(String), city: expect.any(String) },
                },
                tags: expect.any(Array),
                rating: expect.any(Number),
            });
        });

        it('writes RESULT and STATS to the key-value store', async () => {
            await runNormal({ firstNumber: 2, secondNumber: 3, waitSeconds: 0, includeBookFixture: true });

            expect(Actor.setValue).toHaveBeenCalledWith('RESULT', { sum: 5 });
            expect(Actor.setValue).toHaveBeenCalledWith('STATS', expect.objectContaining({
                bookCount: 3,
                totalRating: expect.any(Number),
                averageRating: expect.any(Number),
            }));
        });
    });

    describe('status and exit lifecycle', () => {
        it('sets the "Processing" status message before computing', async () => {
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 0, includeBookFixture: false });
            expect(Actor.setStatusMessage).toHaveBeenCalledExactlyOnceWith('Processing');
        });

        it('calls exit with the success message at the end', async () => {
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 0, includeBookFixture: false });
            expect(Actor.exit).toHaveBeenCalledExactlyOnceWith('Successfully completed');
        });
    });

    describe('delay behaviour', () => {
        it('does not sleep when delay is 0', async () => {
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 0, includeBookFixture: false });
            expect(setTimeout).not.toHaveBeenCalled();
        });

        it('sleeps for waitSeconds when delay > 0', async () => {
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 5, includeBookFixture: false });
            expect(setTimeout).toHaveBeenCalledExactlyOnceWith(5000);
        });

        it('sleeps before pushing data', async () => {
            const order: string[] = [];
            vi.mocked(Actor.setStatusMessage).mockImplementation(async () => {
                order.push('status');
                return undefined as never;
            });
            vi.mocked(setTimeout).mockImplementation(async () => {
                order.push('sleep');
                return undefined as never;
            });
            vi.mocked(Actor.pushData).mockImplementation(async () => {
                order.push('push');
                return undefined as never;
            });
            vi.mocked(Actor.exit).mockImplementation(async () => {
                order.push('exit');
                return undefined as never;
            });
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 2, includeBookFixture: false });
            expect(order).toEqual(['status', 'sleep', 'push', 'exit']);
        });

        it('skips the sleep step but keeps other order when delay=0', async () => {
            const order: string[] = [];
            vi.mocked(Actor.setStatusMessage).mockImplementation(async () => {
                order.push('status');
                return undefined as never;
            });
            vi.mocked(setTimeout).mockImplementation(async () => {
                order.push('sleep');
                return undefined as never;
            });
            vi.mocked(Actor.pushData).mockImplementation(async () => {
                order.push('push');
                return undefined as never;
            });
            vi.mocked(Actor.exit).mockImplementation(async () => {
                order.push('exit');
                return undefined as never;
            });
            await runNormal({ firstNumber: 1, secondNumber: 1, waitSeconds: 0, includeBookFixture: false });
            expect(order).toEqual(['status', 'push', 'exit']);
        });
    });
});
