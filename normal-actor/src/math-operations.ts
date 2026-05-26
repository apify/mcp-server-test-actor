/**
 * Pure math helpers used to enrich the default dataset item with nested,
 * varied-shape data for MCP storage tool testing. Input bounds are enforced
 * at the actor boundary (firstNumber/secondNumber capped at 10) so these
 * helpers don't need their own safety caps.
 */

export interface Operations {
    math: {
        fibonacci: number[];
        factorial: { first: number | null; second: number | null };
    };
    isSumPrime: boolean;
}

export function computeOperations(first: number, second: number): Operations {
    const sum = first + second;
    return {
        math: {
            fibonacci: fibonacci(sum),
            factorial: { first: factorial(first), second: factorial(second) },
        },
        isSumPrime: isPrime(sum),
    };
}

export function factorial(n: number): number | null {
    if (!Number.isInteger(n) || n < 0) return null;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

export function fibonacci(count: number): number[] {
    if (count <= 0) return [];
    const result: number[] = [0];
    if (count === 1) return result;
    result.push(1);
    while (result.length < count) {
        result.push(result[result.length - 1] + result[result.length - 2]);
    }
    return result;
}

export function isPrime(n: number): boolean {
    if (!Number.isInteger(n) || n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    const limit = Math.sqrt(n);
    for (let i = 3; i <= limit; i += 2) {
        if (n % i === 0) return false;
    }
    return true;
}
