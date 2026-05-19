## Apify Normal Test Actor

A minimal Apify Actor used as a counterpart to the [MCP server test actor](../mcp-server-actor). It exists to exercise the regular (non-standby) Actor execution path.

## What it does

The Actor runs only in normal mode. It reads two integers from input, optionally waits for a configurable number of seconds, computes their sum, and pushes `{ firstNumber, secondNumber, sum }` to the default dataset before exiting.

## Input

| Field          | Type    | Required | Description                                                |
| -------------- | ------- | -------- | ---------------------------------------------------------- |
| `firstNumber`  | integer | yes      | First addend.                                              |
| `secondNumber` | integer | yes      | Second addend.                                             |
| `waitSeconds`  | integer | no       | Seconds to wait before computing the sum (default: `0`).   |

Example:

```json
{ "firstNumber": 2, "secondNumber": 3, "waitSeconds": 0 }
```

## Output

A single item pushed to the default dataset:

```json
{ "firstNumber": 2, "secondNumber": 3, "sum": 5 }
```

## Getting started

```bash
apify run
```

## Deploy to Apify

```bash
apify push
```
