import { describe, it, expect } from 'vitest';

import { computeOperations, factorial, fibonacci, isPrime } from '../../src/math-operations.js';

describe('factorial', () => {
    it('returns 1 for 0', () => expect(factorial(0)).toBe(1));
    it('returns n! across the valid input range (0–10)', () => {
        expect(factorial(1)).toBe(1);
        expect(factorial(5)).toBe(120);
        expect(factorial(10)).toBe(3628800);
    });
    it('returns null for negatives', () => expect(factorial(-3)).toBeNull());
    it('returns null for non-integers', () => expect(factorial(3.5)).toBeNull());
});

describe('fibonacci', () => {
    it('returns [] for non-positive counts', () => {
        expect(fibonacci(0)).toEqual([]);
        expect(fibonacci(-1)).toEqual([]);
    });
    it('returns [0] for count=1', () => expect(fibonacci(1)).toEqual([0]));
    it('returns the first N Fibonacci numbers', () => {
        expect(fibonacci(7)).toEqual([0, 1, 1, 2, 3, 5, 8]);
    });
});

describe('isPrime', () => {
    it.each([
        [-3, false],
        [0, false],
        [1, false],
        [2, true],
        [4, false],
        [17, true],
        [25, false],
        [97, true],
    ])('isPrime(%i) === %s', (n, expected) => {
        expect(isPrime(n)).toBe(expected);
    });
});

describe('computeOperations', () => {
    it('returns the nested shape (fibonacci + factorial + isSumPrime)', () => {
        expect(computeOperations(3, 4)).toEqual({
            math: {
                fibonacci: [0, 1, 1, 2, 3, 5, 8],
                factorial: { first: 6, second: 24 },
            },
            isSumPrime: true,
        });
    });

    it('computes factorial + fibonacci + primality at the upper bound (10 + 10)', () => {
        expect(computeOperations(10, 10)).toEqual({
            math: {
                fibonacci: fibonacci(20),
                factorial: { first: 3628800, second: 3628800 },
            },
            isSumPrime: false,
        });
    });
});
