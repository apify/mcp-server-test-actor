import { Actor, log } from 'apify';

import { inputSchema } from './input-schema.js';
import { runNormal } from './run-actor.js';

// Initialize the Apify Actor environment
// This call configures the Actor for its environment and should be called at startup
await Actor.init();

const rawInput = await Actor.getInput();
let input;
try {
    input = inputSchema.parse(rawInput ?? {});
} catch (err) {
    log.error('Invalid Actor input', { error: err });
    await Actor.fail('Invalid Actor input');
}
if (input) {
    await runNormal(input);
}

// Handle server shutdown
process.on('SIGINT', async () => {
    log.info('Shutting down...');
    await Actor.exit();
});
