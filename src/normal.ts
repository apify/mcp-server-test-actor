import { log } from 'apify';

export interface NormalDeps {
    setStatusMessage: (message: string) => Promise<unknown>;
    pushData: (data: Record<string, unknown>) => Promise<unknown>;
    exit: (message?: string) => Promise<unknown>;
    sleep: (ms: number) => Promise<unknown>;
}

export interface Input {
    firstNumber: number;
    secondNumber: number;
    delaySeconds: number;
}

export async function runNormal(
    { firstNumber, secondNumber, delaySeconds }: Input,
    deps: NormalDeps,
): Promise<void> {
    await deps.setStatusMessage('Processing');

    if (delaySeconds > 0) {
        log.info(`Waiting ${delaySeconds}s before computing sum`);
        await deps.sleep(delaySeconds * 1000);
    }

    const sum = firstNumber + secondNumber;
    log.info('Computed sum', { firstNumber, secondNumber, sum });
    await deps.pushData({ firstNumber, secondNumber, sum });
    await deps.exit('Successfully completed');
}
