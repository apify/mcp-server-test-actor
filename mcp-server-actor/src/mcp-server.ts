import { setTimeout } from 'node:timers/promises';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import { Actor, log } from 'apify';
import * as z from 'zod';

import { inputSchema } from './input-schema.js';

export const getServer = () => {
    // Create an MCP server with implementation details
    const server = new McpServer(
        {
            name: 'mcp-server-test-actor',
            version: '1.0.0',
        },
        { capabilities: { logging: {} } },
    );

    // Register a tool for adding two numbers with structured output
    server.registerTool(
        'add',
        {
            description: 'Adds two numbers together and returns the sum with structured output',
            inputSchema: inputSchema.shape,
            outputSchema: {
                result: z.number().int().describe('The sum of firstNumber and secondNumber'),
                operands: z.object({
                    firstNumber: z.number().int(),
                    secondNumber: z.number().int(),
                }),
                operation: z.string().describe('The operation performed'),
            },
        },
        async ({ firstNumber, secondNumber, waitSeconds }): Promise<CallToolResult> => {
            try {
                // Charge for the tool call
                await Actor.charge({ eventName: 'tool-call' });
                log.info('Charged for tool-call event');

                if (waitSeconds > 0) {
                    log.info(`Waiting ${waitSeconds}s before computing sum`);
                    await setTimeout(waitSeconds * 1000);
                }

                const sum = firstNumber + secondNumber;
                const structuredContent = {
                    result: sum,
                    operands: { firstNumber, secondNumber },
                    operation: 'addition',
                };

                return {
                    content: [
                        {
                            type: 'text',
                            text: `The sum of ${firstNumber} and ${secondNumber} is ${sum}`,
                        },
                    ],
                    structuredContent,
                };
            } catch (error) {
                log.error('Error in add tool:', {
                    error,
                });
                throw error;
            }
        },
    );

    // Create a simple dummy resource at a fixed URI
    server.registerResource(
        'calculator-info',
        'https://example.com/calculator',
        { mimeType: 'text/plain' },
        async (): Promise<ReadResourceResult> => {
            return {
                contents: [
                    {
                        uri: 'https://example.com/calculator',
                        text: 'This is a simple calculator MCP server that can add two numbers together.',
                    },
                ],
            };
        },
    );

    return server;
};
