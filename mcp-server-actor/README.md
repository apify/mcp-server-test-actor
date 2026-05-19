## Apify MCP Server Test Actor

A simple Actor for testing the [Apify MCP server](https://mcp.apify.com/) integration. Use it to verify that your MCP client can discover and call Actor tools correctly.

## What it does

This Actor exposes a minimal MCP server as it's designed to be the simplest possible end-to-end test of the Apify MCP server integration.

## Run modes

The Actor supports two execution modes, selected automatically based on how the Actor is launched:

- **Standby (MCP server)** — When launched via [Apify Standby](https://docs.apify.com/platform/actors/running/standby), the Actor runs as an HTTP server exposing the MCP endpoint at `POST /mcp`.
- **Normal (add two numbers)** — When launched as a regular one-shot run, the Actor reads `firstNumber` and `secondNumber` (and an optional `delay` in seconds) from input, pushes `{ firstNumber, secondNumber, sum }` to the default dataset, and exits.

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
