import { setTimeout } from 'node:timers/promises';

import { Actor, log } from 'apify';

import type { Input } from './input-schema.js';

export async function runNormal({ firstNumber, secondNumber, waitSeconds }: Input): Promise<void> {
    await Actor.setStatusMessage('Processing');

    if (waitSeconds > 0) {
        log.info(`Waiting ${waitSeconds}s before computing sum`);
        await setTimeout(waitSeconds * 1000);
    }

    const sum = firstNumber + secondNumber;
    log.info('Computed sum', { firstNumber, secondNumber, sum });
    await Actor.pushData({ firstNumber, secondNumber, sum });
    await Actor.exit('Successfully completed');
}
