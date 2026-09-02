# Runpod Gemma Setup

This deploys Gemma as the low-cost recipe-import prefilter. The Render backend
remains the only application service that calls the Runpod endpoint.

## 1. Create the accounts and secrets

1. Create a Runpod account, add a small credit balance, and create a Runpod API
   key.
2. Create a Hugging Face account, accept Google's Gemma terms for
   `google/gemma-3-4b-it`, then create a read-only access token.
3. Store both tokens only in Runpod or Render secret settings. Never commit or
   paste them into project files.

## 2. Create the Runpod endpoint

Use Runpod Hub's latest `vLLM` worker and create a Serverless Flex endpoint.
Choose a 16 GB GPU option such as A4000, A4500, or RTX 4000. Keep the minimum
active workers at zero and limit the endpoint to one worker while validating
quality and cost.

Set these endpoint environment variables:

| Variable | Value |
| --- | --- |
| `MODEL_NAME` | `google/gemma-3-4b-it` |
| `HF_TOKEN` | Hugging Face read token |
| `OPENAI_SERVED_MODEL_NAME_OVERRIDE` | `recipe-gemma` |
| `MAX_MODEL_LEN` | `8192` |
| `DTYPE` | `bfloat16` |
| `GPU_MEMORY_UTILIZATION` | `0.90` |
| `MAX_CONCURRENCY` | `1` |
| `DISABLE_LOG_REQUESTS` | `true` |

Runpod will show an endpoint ID after creation. Its OpenAI-compatible base URL
has this shape:

```
https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/openai/v1
```

## 3. Configure Render

In the Render backend service, set these environment variables:

| Variable | Value |
| --- | --- |
| `AI_PREFILTER_ENABLED` | `true` |
| `GEMMA_BASE_URL` | the Runpod base URL above |
| `GEMMA_API_KEY` | Runpod API key |
| `GEMMA_MODEL` | `recipe-gemma` |
| `GEMMA_WARM_WINDOW_SECONDS` | `50` |
| `GEMMA_WARM_REQUEST_TIMEOUT_SECONDS` | `15` |
| `GEMMA_ASSUME_WARM` | `false` |

Keep `OPENAI_API_KEY` configured. It is the quality fallback when the prefilter
is unavailable or uncertain.

## 4. Validate before enabling traffic

1. Send one OpenAI-compatible chat completion to the Runpod endpoint.
2. Import several recipe URLs, including Hebrew pages and a page without
   JSON-LD.
3. In Render logs, confirm `recipe_ai_route=gemma` for high-confidence imports
   and `recipe_ai_route=strong_fallback` only for uncertain imports.
4. Check Runpod's usage page after the test. Keep the spending limit low until
   the route quality is validated.

With scale-to-zero, do not use a Render cron to ping Gemma: a request every
minute keeps the GPU billed continuously. The router trusts only a successful
Gemma completion from the same backend process, then uses Gemma for 50 seconds.
When no such recent completion exists, it sends the import directly to OpenAI
instead of waiting for a cold GPU to start. `GEMMA_ASSUME_WARM` is only for a
local model that is already running continuously.
