## Apify MCP Server Test Actor

A simple Actor for testing the [Apify MCP server](https://mcp.apify.com/) integration. Use it to verify that your MCP client can discover and call Actor tools correctly.

## What it does

This Actor exposes a minimal MCP server as it's designed to be the simplest possible end-to-end test of the Apify MCP server integration.

## Run modes

The Actor supports two execution modes, selected via the `mode` input dropdown:

- **MCP server (standby)** — Runs the Actor as an HTTP server exposing the MCP endpoint at `POST /mcp`. This is the default and is used by [Apify Standby](https://docs.apify.com/platform/actors/running/standby) when an MCP client connects to the standby URL.
- **Normal (add two numbers)** — Reads `firstNumber` and `secondNumber` from input, pushes `{ firstNumber, secondNumber, sum }` to the default dataset, and exits.

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
