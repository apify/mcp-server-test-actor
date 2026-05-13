import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { CallToolResult, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import { log, Actor } from 'apify';

export const getServer = () => {
    // Create an MCP server with implementation details
    const server = new McpServer(
        {
            name: 'ts-mcp-empty',
            version: '1.0.0',
        },
        { capabilities: { logging: {} } },
    );

    // Register a tool for adding two numbers with structured output
    server.registerTool(
        'add',
        {
            description: 'Adds two numbers together and returns the sum with structured output',
            inputSchema: {
                a: z.number().int().describe('First number to add'),
                b: z.number().int().describe('Second number to add'),
            },
            outputSchema: {
                result: z.number().int().describe('The sum of a and b'),
                operands: z.object({
                    a: z.number().int(),
                    b: z.number().int(),
                }),
                operation: z.string().describe('The operation performed'),
            },
        },
        async ({ a, b }): Promise<CallToolResult> => {
            try {
                // Charge for the tool call
                await Actor.charge({ eventName: 'tool-call' });
                log.info('Charged for tool-call event');

                const sum = a + b;
                const structuredContent = {
                    result: sum,
                    operands: { a, b },
                    operation: 'addition',
                };

                return {
                    content: [
                        {
                            type: 'text',
                            text: `The sum of ${a} and ${b} is ${sum}`,
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
