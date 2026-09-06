import { computed } from "vue"
import type { Ref } from "vue"

export interface AgentToolUsage {
  name: string
  calls: string
  successRate: string
}

export interface AgentDetail {
  id: string
  name: string
  desc: string
  status: string
  runs: number
  runsDisplay: string
  successRate: string
  tokenUsage: string
  cost: string
  earnings: string
  memories: string[]
  toolUsage: AgentToolUsage[]
}

const textOf = (value: unknown): string => (typeof value === "string" ? value : "")

function normalizeDetail(input: unknown): AgentDetail | null {
  if (!input || typeof input !== "object") return null
  const src = input as Record<string, unknown>
  const name = textOf(src.name).trim().slice(0, 120)
  const id = textOf(src.id).trim().slice(0, 120)
  if (id === "" || name === "") return null
  const runsRaw = typeof src.runs === "number" ? src.runs : Number(src.runs)
  const runs = Number.isFinite(runsRaw) && (runsRaw as number) >= 0 ? Math.floor(runsRaw as number) : 0
  const memories = Array.isArray(src.memories)
    ? src.memories
        .filter((m): m is string => typeof m === "string")
        .map((m) => m.trim())
        .filter((m) => m !== "")
        .slice(0, 20)
    : []
  const toolUsage = Array.isArray(src.toolUsage)
    ? src.toolUsage
        .filter((t): t is Record<string, unknown> => !!t && typeof t === "object")
        .map((t) => ({
          name: textOf(t.name).trim().slice(0, 80) || "Tool",
          calls: textOf(t.calls).trim().slice(0, 40) || "0",
          successRate: textOf(t.successRate).trim().slice(0, 20) || "—",
        }))
        .slice(0, 20)
    : []
  return {
    id,
    name,
    desc: textOf(src.desc).trim().slice(0, 500),
    status: textOf(src.status).trim().slice(0, 20) || "Active",
    runs,
    runsDisplay: runs.toLocaleString("en-US"),
    successRate: textOf(src.successRate).trim().slice(0, 20) || "—",
    tokenUsage: textOf(src.tokenUsage).trim().slice(0, 20) || "—",
    cost: textOf(src.cost).trim().slice(0, 20) || "—",
    earnings: textOf(src.earnings).trim().slice(0, 20) || "—",
    memories,
    toolUsage,
  }
}

/**
 * Single-agent detail state.
 *
 * Chain: `my-agents/[id].vue` page -> this composable -> `/api/agents/:id`
 * (Nitro, holds the backend secret) -> FastAPI `{backend}/v1/agents/:id`.
 */
export function useAgentDetail(id: string | Ref<string>) {
  const idRef = computed(() => (typeof id === "string" ? id : id.value))

  const { data, pending, error, refresh } = useAsyncData(
    "agent-detail",
    () => {
      const current = idRef.value.trim()
      if (current === "") return Promise.resolve({ agent: null })
      return $fetch<{ agent: unknown }>(`/api/agents/${encodeURIComponent(current)}`)
    },
    { watch: [idRef] },
  )

  const agent = computed<AgentDetail | null>(() => normalizeDetail(data.value?.agent))

  const isNotFound = computed(
    () =>
      !pending.value &&
      agent.value === null &&
      (error.value?.statusCode === 404 || data.value != null),
  )

  const loadError = computed(() => {
    if (!error.value || error.value.statusCode === 404) return ""
    return "Could not load this agent. Please try again."
  })

  const stats = computed(() => [
    { label: "Runs", value: agent.value?.runsDisplay ?? "0" },
    { label: "Success rate", value: agent.value?.successRate ?? "—" },
    { label: "Token usage", value: agent.value?.tokenUsage ?? "—" },
    { label: "Cost", value: agent.value?.cost ?? "—" },
    { label: "Earnings", value: agent.value?.earnings ?? "—" },
  ])

  return { agent, pending, error: loadError, isNotFound, stats, refresh }
}
