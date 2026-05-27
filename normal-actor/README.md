## Apify Normal Test Actor

A minimal Apify Actor used as a counterpart to the [MCP server test actor](../mcp-server-actor). It exists to exercise the regular (non-standby) Actor execution path.

## What it does

The Actor runs only in normal mode. On every run it:

1. Reads two integers from input, optionally waits `waitSeconds`, computes their sum, and pushes a nested item (`{ firstNumber, secondNumber, sum, math: { fibonacci, factorial }, isSumPrime }`) to the **default** dataset.
2. Pushes a built-in fictional book fixture (up to `maxBooks` items, defaults to all available) to the **`books`** aliased dataset. The fixture is deliberately diverse-typed (strings, ISO dates, numbers, booleans, primitive/object arrays, deeply nested objects, a hidden `#_internal` block) so the MCP server's storage tools can be exercised against varied paths and the `clean=true` filter.
3. Writes `RESULT`, `STATS`, `LOG` (text/plain), and `COVER` (image/png) records to the default key-value store, alongside the auto-populated `INPUT`.

## Input

| Field          | Type    | Required | Description                                                                                |
| -------------- | ------- | -------- | ------------------------------------------------------------------------------------------ |
| `firstNumber`  | integer | yes      | First addend. Bounded `0–10` so derived math operations stay tractable.                     |
| `secondNumber` | integer | yes      | Second addend. Bounded `0–10`.                                                              |
| `waitSeconds`  | integer | no       | Seconds to wait before computing the sum (default: `0`).                                    |
| `maxBooks`     | integer | no       | Maximum number of books to scrape from the fixture (min `1`). Defaults to all books.        |

Example:

```json
{ "firstNumber": 2, "secondNumber": 3, "waitSeconds": 0 }
```

## Output

Default dataset — one nested item:

```json
{
  "firstNumber": 2,
  "secondNumber": 3,
  "sum": 5,
  "math": {
    "fibonacci": [0, 1, 1, 2, 3],
    "factorial": { "first": 2, "second": 6 }
  },
  "isSumPrime": true
}
```

`books` aliased dataset — fictional book items with nested structure, e.g.:

```json
{
  "title": "async/await and Other Lies I Told My Scraper",
  "author": "Nadia \"node_modules\" Petrov",
  "pages": 1337,
  "rating": 4.2,
  "inStock": true,
  "scrapedAt": "2026-05-26T09:12:00.000Z",
  "tags": ["async", "scraping-noir", "callback-hell"],
  "publication": { "year": 2025, "publisher": { "name": "Apify Press", "city": "Prague" } },
  "reviews": [{ "quote": "…", "source": "JavaScript Weekly" }]
}
```

Default key-value store — `INPUT` (auto), `RESULT` (`{ sum }`), `STATS` (book aggregates), `LOG` (text/plain), `COVER` (1x1 transparent PNG, image/png).

## Getting started

```bash
apify run
```

## Deploy to Apify

```bash
apify push
```
