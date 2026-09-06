/**
 * GET /api/agents/mine
 *
 * Browser -> this Nitro handler -> FastAPI `GET {backendBaseUrl}/v1/agents/mine`.
 * The backend base URL stays server-side in private runtimeConfig (`backendBaseUrl`).
 * Normalises the payload to `{ agents: MyAgent[] }` (accepts a plain array or
 * an `{ items }` envelope) so the page only handles one shape.
 */

const textOf = (value: unknown): string => (typeof value === "string" ? value : "")

const numOf = (value: unknown): number => {
  const n =
    typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN
  return Number.isFinite(n) && (n as number) >= 0 ? (n as number) : 0
}

const slugOf = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)

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

  let upstream: Response
  try {
    upstream = await fetch(`${backendBase}/api/v1/agents/mine`, {
      method: "GET",
      headers: { accept: "application/json" },
    })
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "Could not reach the agent backend. Please try again.",
    })
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
  const items = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)
      ? (data as { items: unknown[] }).items
      : []

  const agents = items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => {
      const name = textOf(item.name).trim().slice(0, 120)
      const idRaw = textOf(item.id).trim() || textOf(item.slug).trim()
      const rawStatus = textOf(item.status).toLowerCase()
      return {
        id: idRaw.slice(0, 120) || slugOf(name),
        name,
        desc: (textOf(item.desc) || textOf(item.description) || textOf(item.tagline))
          .trim()
          .slice(0, 300),
        visibility: item.visibility === "Public" ? "Public" : "Private",
        status: rawStatus === "paused" || rawStatus === "disabled" ? "Paused" : "Active",
        accuracy: numOf(item.accuracy),
        runs: Math.floor(numOf(item.runs)),
        lastRun: textOf(item.lastRun).trim().slice(0, 60) || "—",
      }
    })
    .filter((agent) => agent.id !== "" && agent.name !== "")

  return { agents }
})
