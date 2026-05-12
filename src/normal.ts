import { setTimeout } from 'node:timers/promises';
import { Actor, log } from 'apify';

export interface Input {
    firstNumber: number;
    secondNumber: number;
    delaySeconds: number;
}

export async function runNormal({ firstNumber, secondNumber, delaySeconds }: Input): Promise<void> {
    await Actor.setStatusMessage('Processing');

    if (delaySeconds > 0) {
        log.info(`Waiting ${delaySeconds}s before computing sum`);
        await setTimeout(delaySeconds * 1000);
    }

    const sum = firstNumber + secondNumber;
    log.info('Computed sum', { firstNumber, secondNumber, sum });
    await Actor.pushData({ firstNumber, secondNumber, sum });
    await Actor.exit('Successfully completed');
}
