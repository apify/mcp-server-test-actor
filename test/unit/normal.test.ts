import { describe, it, expect, vi, beforeAll } from 'vitest';
import { log } from 'apify';
import { runNormal, type NormalDeps } from '../../src/normal.js';

beforeAll(() => {
    // Silence Apify logger output during tests
    log.setLevel(log.LEVELS.OFF);
});

function createMockDeps(): NormalDeps {
    return {
        setStatusMessage: vi.fn().mockResolvedValue(undefined),
        pushData: vi.fn().mockResolvedValue(undefined),
        exit: vi.fn().mockResolvedValue(undefined),
        sleep: vi.fn().mockResolvedValue(undefined),
    };
}

describe('runNormal', () => {
    // Keeping this simple as it's not the main functionality of the actor
    describe('sum computation', () => {
        it('pushes the sum of two positive integers', async () => {
            const deps = createMockDeps();
            await runNormal({ firstNumber: 2, secondNumber: 3, delaySeconds: 0 }, deps);
            expect(deps.pushData).toHaveBeenCalledExactlyOnceWith({
                firstNumber: 2,
                secondNumber: 3,
                sum: 5,
            });
        });
    });

    describe('status and exit lifecycle', () => {
        it('sets the "Processing" status message before computing', async () => {
            const deps = createMockDeps();
            await runNormal({ firstNumber: 1, secondNumber: 1, delaySeconds: 0 }, deps);
            expect(deps.setStatusMessage).toHaveBeenCalledExactlyOnceWith('Processing');
        });

        it('calls exit with the success message at the end', async () => {
            const deps = createMockDeps();
            await runNormal({ firstNumber: 1, secondNumber: 1, delaySeconds: 0 }, deps);
            expect(deps.exit).toHaveBeenCalledExactlyOnceWith('Successfully completed');
        });
    });

    describe('delay behaviour', () => {
        it('does not sleep when delay is 0', async () => {
            const deps = createMockDeps();
            await runNormal({ firstNumber: 1, secondNumber: 1, delaySeconds: 0 }, deps);
            expect(deps.sleep).not.toHaveBeenCalled();
        });

        it('sleeps for delaySeconds when delay > 0', async () => {
            const deps = createMockDeps();
            await runNormal({ firstNumber: 1, secondNumber: 1, delaySeconds: 5 }, deps);
            expect(deps.sleep).toHaveBeenCalledExactlyOnceWith(5000);
        });

        it('sleeps before pushing data', async () => {
            const order: string[] = [];
            const deps: NormalDeps = {
                setStatusMessage: vi.fn().mockImplementation(async () => {
                    order.push('status');
                }),
                pushData: vi.fn().mockImplementation(async () => {
                    order.push('push');
                }),
                exit: vi.fn().mockImplementation(async () => {
                    order.push('exit');
                }),
                sleep: vi.fn().mockImplementation(async () => {
                    order.push('sleep');
                }),
            };
            await runNormal({ firstNumber: 1, secondNumber: 1, delaySeconds: 2 }, deps);
            expect(order).toEqual(['status', 'sleep', 'push', 'exit']);
        });

        it('skips the sleep step but keeps other order when delay=0', async () => {
            const order: string[] = [];
            const deps: NormalDeps = {
                setStatusMessage: vi.fn().mockImplementation(async () => {
                    order.push('status');
                }),
                pushData: vi.fn().mockImplementation(async () => {
                    order.push('push');
                }),
                exit: vi.fn().mockImplementation(async () => {
                    order.push('exit');
                }),
                sleep: vi.fn().mockImplementation(async () => {
                    order.push('sleep');
                }),
            };
            await runNormal({ firstNumber: 1, secondNumber: 1, delaySeconds: 0 }, deps);
            expect(order).toEqual(['status', 'push', 'exit']);
        });
    });
});
