## Apify Normal Test Actor

A minimal Apify Actor used as a counterpart to the [MCP server test actor](../mcp-server-actor). It exists to exercise the regular (non-standby) Actor execution path.

## What it does

The Actor runs only in normal mode. It reads two integers from input, optionally waits for a configurable number of seconds, computes their sum, and pushes `{ firstNumber, secondNumber, sum }` to the default dataset before exiting.

Set `includeBookFixture: true` to push a fictional Apify book fixture (3 nested items) to the default dataset instead, and to write `RESULT` and `STATS` records to the default key-value store. This fixture exists to exercise the MCP server's storage tools against deeply nested fields.

## Input

| Field                | Type    | Required | Description                                                |
| -------------------- | ------- | -------- | ---------------------------------------------------------- |
| `firstNumber`        | integer | yes      | First addend.                                              |
| `secondNumber`       | integer | yes      | Second addend.                                             |
| `waitSeconds`        | integer | no       | Seconds to wait before computing the sum (default: `0`).   |
| `includeBookFixture` | boolean | no       | Push the book fixture instead of the sum item (default: `false`). |

Example:

```json
{ "firstNumber": 2, "secondNumber": 3, "waitSeconds": 0 }
```

## Output

Default mode — a single item pushed to the default dataset:

```json
{ "firstNumber": 2, "secondNumber": 3, "sum": 5 }
```

Book fixture mode (`includeBookFixture: true`) — three items with nested structure pushed to the default dataset:

```json
{
  "title": "The Apify Whisperer",
  "author": { "name": "A. Crawler", "country": "CZ" },
  "publication": { "year": 2024, "publisher": { "name": "Acme Press", "city": "Prague" } },
  "tags": ["scraping", "apify", "fiction"],
  "rating": 4.5
}
```

Plus two key-value store records (`RESULT` with `{ sum }` and `STATS` with book aggregates) alongside the auto-populated `INPUT`.

## Getting started

```bash
apify run
```

## Deploy to Apify

```bash
apify push
```
