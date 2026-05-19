import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Actor, log } from 'apify';
import cors from 'cors';
import type { Request, Response } from 'express';
import express from 'express';

import { getServer } from './mcp-server.js';

// Initialize the Apify Actor environment
// This call configures the Actor for its environment and should be called at startup
await Actor.init();

const app = express();
app.use(express.json());

// Configure CORS to expose Mcp-Session-Id header for browser-based clients
app.use(
    cors({
        origin: '*', // Allow all origins - adjust as needed for production
        exposedHeaders: ['Mcp-Session-Id'],
    }),
);

// Readiness probe handler
app.get('/', (req: Request, res: Response) => {
    if (req.headers['x-apify-container-server-readiness-probe']) {
        log.info('Readiness probe');
        res.end('ok\n');
        return;
    }
    res.status(404).end();
});

app.post('/mcp', async (req: Request, res: Response) => {
    const server = getServer();
    try {
        const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
        });
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        res.on('close', () => {
            log.info('Request closed');
            void transport.close();
            void server.close();
        });
    } catch (error) {
        log.error('Error handling MCP request:', {
            error,
        });
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: 'Internal server error',
                },
                id: null,
            });
        }
    }
});

const methodNotAllowed = (method: string) => (_req: Request, res: Response) => {
    log.info(`Received ${method} MCP request`);
    res.writeHead(405).end(
        JSON.stringify({
            jsonrpc: '2.0',
            error: {
                code: -32000,
                message: 'Method not allowed.',
            },
            id: null,
        }),
    );
};

app.get('/mcp', methodNotAllowed('GET'));
app.delete('/mcp', methodNotAllowed('DELETE'));

// Start the server
const PORT = process.env.ACTOR_STANDBY_PORT ? parseInt(process.env.ACTOR_STANDBY_PORT, 10) : 3000;
app.listen(PORT, (error) => {
    if (error) {
        log.error('Failed to start server:', {
            error,
        });
        process.exit(1);
    }
    log.info(`MCP Server listening on port ${PORT}`);
});

// Handle server shutdown
process.on('SIGINT', async () => {
    log.info('Shutting down server...');
    await Actor.exit();
});
