/**
 * GET /api/marketplace/agents
 *
 * Browser -> this Nitro handler -> FastAPI `GET {backendBaseUrl}/v1/marketplace/agents`.
 * The backend base URL stays server-side in private runtimeConfig (`backendBaseUrl`).
 * Normalises the payload to `{ agents: MarketplaceAgent[] }` (accepts a plain
 * array or an `{ items }` envelope) so the page only handles one shape.
 */

const textOf = (value: unknown): string => (typeof value === "string" ? value : "")

const slugOf = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)

const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const init = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase()
  return init || "AG"
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

  const query = getQuery(event)
  const q = typeof query.q === "string" ? query.q.slice(0, 120) : ""
  const type = typeof query.type === "string" ? query.type.slice(0, 60) : ""

  let upstream: Response
  try {
    const url = new URL(`${backendBase}/api/v1/marketplace/agents`)
    if (q) url.searchParams.set("q", q)
    if (type) url.searchParams.set("type", type)
    upstream = await fetch(url.toString(), {
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
      return {
        id: idRaw.slice(0, 120) || slugOf(name),
        name,
        type: textOf(item.type).trim().slice(0, 60) || "Agent",
        description: (textOf(item.description) || textOf(item.tagline)).trim().slice(0, 500),
        users: (textOf(item.users) || textOf(item.installs)).trim().slice(0, 20) || "0",
        author: (textOf(item.author) || textOf(item.owner)).trim().slice(0, 60) || "Community",
        initials: textOf(item.initials).trim().slice(0, 4).toUpperCase() || initialsOf(name),
      }
    })
    .filter((agent) => agent.id !== "" && agent.name !== "")

  return { agents }
})
