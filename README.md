## Apify MCP Server Test Actor

A simple Actor for testing the [Apify MCP server](https://mcp.apify.com/) integration. Use it to verify that your MCP client can discover and call Actor tools correctly.

## What it does

This Actor exposes a minimal MCP server as it's designed to be the simplest possible end-to-end test of the Apify MCP server integration.

## Run modes

The Actor supports two execution modes:

- **Standby / MCP server mode** — When the Actor is started in [Apify Standby mode](https://docs.apify.com/platform/actors/running/standby), it runs as an HTTP server and exposes the MCP endpoint at `POST /mcp`. This is the primary mode used by MCP clients.
- **Normal run mode** — When the Actor is invoked as a one-shot run, it reads `firstNumber` and `secondNumber` from input, pushes `{ firstNumber, secondNumber, sum }` to the default dataset, and exits.

The mode is detected automatically via the `APIFY_META_ORIGIN` environment variable (set to `STANDBY` by the Apify platform when running in standby mode).

## Getting started

```bash
apify run
```

## Deploy to Apify

```bash
apify push
```

## Resources

- [Apify MCP server documentation](https://docs.apify.com/platform/integrations/mcp)
- [Apify MCP server configuration](https://mcp.apify.com/)
- [MCP Streamable HTTP transport spec](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#streamable-http)
