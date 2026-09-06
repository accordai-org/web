/**
 * POST /api/agent/chat
 *
 * Browser -> this Nitro handler -> FastAPI `{backendBaseUrl}/v1/agent/chat`.
 *
 * The backend base URL lives in private runtimeConfig (`backendBaseUrl`,
 * fed by `NUXT_BACKEND_BASE_URL` in `.env`) so it never leaks to the client.
 *
 * Always responds as `text/event-stream` with `step` / `delta` / `tools` /
 * `done` / `error` events so `useAgentChat` only handles one protocol —
 * the backend may either stream SSE itself (passed straight through) or
 * return plain JSON (normalised to SSE here).
 */

interface AgentChatRequestBody {
  prompt?: unknown
  /** Legacy alias accepted from older clients. */
  userMessage?: unknown
  tools?: unknown
  skills?: unknown
  history?: unknown
}

interface UpstreamJson {
  message?: unknown
  reply?: unknown
  content?: unknown
  output?: unknown
  text?: unknown
  steps?: unknown
  tools?: unknown
  toolsUsed?: unknown
}

const textOf = (value: unknown): string => (typeof value === "string" ? value : "")

const stringArrayOf = (value: unknown, itemCap = 120, listCap = 20): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.slice(0, itemCap))
    .slice(0, listCap)
}

export default defineEventHandler(async (event) => {
  const { backendBaseUrl } = useRuntimeConfig()
  const backendBase =
    typeof backendBaseUrl === "string" ? backendBaseUrl.trim().replace(/\/+$/, "") : ""

  if (!backendBase) {
    throw createError({
      statusCode: 500,
      statusMessage: "Agent backend is not configured. Set NUXT_BACKEND_BASE_URL.",
    })
  }

  const body = (await readBody<AgentChatRequestBody>(event).catch(() => null)) ?? {}
  const rawPrompt = textOf(body.prompt) || textOf(body.userMessage)
  const prompt = rawPrompt.trim().slice(0, 8000)

  if (!prompt) {
    throw createError({ statusCode: 400, statusMessage: "A non-empty prompt is required." })
  }

  const historyRaw = Array.isArray(body.history) ? body.history.slice(-20) : []
  const history = historyRaw
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: textOf(item.content).slice(0, 8000),
    }))

  const payload = {
    prompt,
    tools: stringArrayOf(body.tools),
    skills: stringArrayOf(body.skills),
    history,
  }

  let upstream: Response
  try {
    upstream = await fetch(`${backendBase}/v1/agent/chat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "text/event-stream, application/json",
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "Could not reach the agent backend. Please try again.",
    })
  }

  // Best effort: stop consuming the upstream body if the browser goes away.
  event.node.req.on("close", () => {
    try {
      void upstream.body?.cancel()
    } catch {
      // Already consumed or closed — nothing to do.
    }
  })

  const upstreamType = upstream.headers.get("content-type") ?? ""

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "")
    throw createError({
      statusCode: upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502,
      statusMessage:
        detail.trim().slice(0, 300) || `Agent backend responded with HTTP ${upstream.status}.`,
    })
  }

  setResponseHeaders(event, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
    "x-accel-buffering": "no",
  })

  // Live backend stream — pass straight through to the browser.
  if (upstreamType.includes("text/event-stream")) {
    return upstream.body
  }

  // Plain JSON backend — normalise to the same SSE protocol.
  const data = (await upstream.json().catch(() => null)) as UpstreamJson | null
  const message =
    textOf(data?.message) ||
    textOf(data?.reply) ||
    textOf(data?.content) ||
    textOf(data?.output) ||
    textOf(data?.text)
  const stepList = stringArrayOf(data?.steps, 200, 20)
  const toolsUsed = stringArrayOf(data?.tools)
    .concat(stringArrayOf(data?.toolsUsed))
    .slice(0, 20)

  const encoder = new TextEncoder()
  const frame = (name: string, payloadData: unknown): Uint8Array =>
    encoder.encode(`event: ${name}\ndata: ${JSON.stringify(payloadData)}\n\n`)

  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const text of stepList) controller.enqueue(frame("step", { text }))
      if (message) {
        for (let i = 0; i < message.length; i += 120) {
          controller.enqueue(frame("delta", { content: message.slice(i, i + 120) }))
        }
      }
      if (toolsUsed.length > 0) controller.enqueue(frame("tools", { tools: toolsUsed }))
      if (message) {
        controller.enqueue(frame("done", { tools: toolsUsed }))
      } else {
        controller.enqueue(
          frame("error", { message: "Pointer returned an empty response. Please try again." }),
        )
      }
      controller.close()
    },
  })
})
