## Apify MCP Server Test Actor

A minimal Actor for testing the [Apify MCP server](https://mcp.apify.com/) integration. Use it to verify that your MCP client can discover and call Actor tools correctly.

## What it does

This Actor runs exclusively in [Apify Standby](https://docs.apify.com/platform/actors/running/standby) mode and exposes an MCP server over HTTP. It registers one tool — `add` — which adds two integers and returns the sum (with an optional artificial wait via `waitSeconds`), plus a static `calculator-info` resource. Each `add` tool call is billed via pay-per-event.

## Endpoints

- `POST /mcp` — Streamable HTTP MCP endpoint.
- `GET /` — Readiness probe (responds `200 ok` when the `x-apify-container-server-readiness-probe` header is present).

## Getting started

```bash
apify run
```

The Actor is standby-only, so to exercise it you need to invoke it as a standby Actor and send MCP requests to the exposed port.

## Deploy to Apify

```bash
apify push
```

## Resources

- [Apify MCP server documentation](https://docs.apify.com/platform/integrations/mcp)
- [Apify MCP server configuration](https://mcp.apify.com/)
- [MCP Streamable HTTP transport spec](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#streamable-http)
