/**
 * GET /api/agents/:id
 *
 * Browser -> this Nitro handler -> FastAPI `GET {backendBaseUrl}/v1/agents/:id`.
 * The backend base URL stays server-side in private runtimeConfig (`backendBaseUrl`).
 * A backend 404 surfaces as a 404 here so the page can render a not-found state.
 */

const textOf = (value: unknown): string => (typeof value === "string" ? value : "")

const numOf = (value: unknown): number => {
  const n =
    typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN
  return Number.isFinite(n) && (n as number) >= 0 ? (n as number) : 0
}

const stringArrayOf = (value: unknown, itemCap = 300, listCap = 20): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, itemCap))
    .filter((item) => item !== "")
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

  const id = (getRouterParam(event, "id") ?? "").trim().slice(0, 120)
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "An agent id is required." })
  }

  let upstream: Response
  try {
    upstream = await fetch(`${backendBase}/api/v1/agents/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: { accept: "application/json" },
    })
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "Could not reach the agent backend. Please try again.",
    })
  }

  if (upstream.status === 404) {
    throw createError({ statusCode: 404, statusMessage: "Agent not found." })
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "")
    throw createError({
      statusCode: upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502,
      statusMessage:
        detail.trim().slice(0, 300) || `Agent backend responded with HTTP ${upstream.status}.`,
    })
  }

  const data: unknown = await upstream.json().catch(() => null)
  const src =
    data && typeof data === "object" && (data as { agent?: unknown }).agent &&
      typeof (data as { agent?: unknown }).agent === "object"
      ? ((data as { agent: Record<string, unknown> }).agent)
      : data && typeof data === "object"
        ? (data as Record<string, unknown>)
        : null

  if (!src) {
    throw createError({ statusCode: 404, statusMessage: "Agent not found." })
  }

  const toolUsageRaw = Array.isArray(src.toolUsage)
    ? src.toolUsage
    : Array.isArray(src.tools)
      ? src.tools
      : []
  const toolUsage = toolUsageRaw
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      name: textOf(item.name).trim().slice(0, 80) || "Tool",
      calls: textOf(item.calls).trim().slice(0, 40) || "0",
      successRate: textOf(item.successRate ?? item.success).trim().slice(0, 20) || "—",
    }))
    .slice(0, 20)

  return {
    agent: {
      id,
      name: textOf(src.name).trim().slice(0, 120) || id,
      desc: (textOf(src.desc) || textOf(src.description) || textOf(src.tagline))
        .trim()
        .slice(0, 500),
      status: textOf(src.status).trim().slice(0, 20) || "Active",
      runs: Math.floor(numOf(src.runs)),
      successRate: textOf(src.successRate).trim().slice(0, 20) || "—",
      tokenUsage: textOf(src.tokenUsage ?? src.tokens).trim().slice(0, 20) || "—",
      cost: textOf(src.cost).trim().slice(0, 20) || "—",
      earnings: textOf(src.earnings).trim().slice(0, 20) || "—",
      memories: stringArrayOf(src.memories),
      toolUsage,
    },
  }
})
