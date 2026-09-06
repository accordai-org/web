import { computed, ref } from "vue"

export type AgentVisibility = "Public" | "Private"
export type AgentStatus = "Active" | "Paused"

export interface MyAgent {
  id: string
  name: string
  desc: string
  visibility: AgentVisibility
  status: AgentStatus
  accuracy: number
  runs: number
  lastRun: string
  color: string
  initial: string
}

/** Avatar colours derived from the agent name — the backend only sends strings. */
const AVATAR_COLORS = [
  "#273BE2",
  "#0E7C5B",
  "#8A5A00",
  "#6D28D9",
  "#0E7490",
  "#A21CAF",
  "#C2410C",
  "#047857",
]

const colorFor = (name: string): string => {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.codePointAt(0)!) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]!
}

const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const init = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase()
  return init || "AG"
}

const textOf = (value: unknown): string => (typeof value === "string" ? value : "")

const numOf = (value: unknown): number => {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : NaN
  return Number.isFinite(n) && (n as number) >= 0 ? (n as number) : 0
}

function normalizeAgent(item: Record<string, unknown>): MyAgent | null {
  const name = textOf(item.name).trim().slice(0, 120)
  const id = textOf(item.id).trim().slice(0, 120)
  if (id === "" || name === "") return null
  const rawStatus = textOf(item.status).toLowerCase()
  return {
    id,
    name,
    desc: textOf(item.desc).trim().slice(0, 300),
    visibility: item.visibility === "Public" ? "Public" : "Private",
    status: rawStatus === "paused" || rawStatus === "disabled" ? "Paused" : "Active",
    accuracy: numOf(item.accuracy),
    runs: Math.floor(numOf(item.runs)),
    lastRun: textOf(item.lastRun).trim().slice(0, 60) || "—",
    color: textOf(item.color).trim() || colorFor(name),
    initial: textOf(item.initial).trim().slice(0, 2).toUpperCase() || initialsOf(name),
  }
}

function normalizeList(input: unknown): MyAgent[] {
  const list = Array.isArray(input)
    ? input
    : input && typeof input === "object" && Array.isArray((input as { agents?: unknown }).agents)
      ? (input as { agents: unknown[] }).agents
      : []
  return list
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map(normalizeAgent)
    .filter((agent): agent is MyAgent => agent !== null)
}

/**
 * "My agents" list state.
 *
 * Chain: `my-agents.vue` page -> this composable -> `/api/agents/mine`
 * (Nitro, holds the backend secret) -> FastAPI `{backend}/v1/agents/mine`.
 */
export function useMyAgents() {
  const { data, pending, error, refresh } = useAsyncData("my-agents", () =>
    $fetch<{ agents?: unknown[] } | unknown[]>("/api/agents/mine"),
  )

  const agents = computed<MyAgent[]>(() => normalizeList(data.value))
  const total = computed(() => agents.value.length)

  const query = ref("")
  const statusFilters = ["All", "Active", "Paused"] as const
  const statusFilter = ref<(typeof statusFilters)[number]>("All")

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    return agents.value.filter((agent) => {
      const matchesStatus = statusFilter.value === "All" || agent.status === statusFilter.value
      const matchesQuery =
        q === "" ||
        agent.name.toLowerCase().includes(q) ||
        agent.desc.toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })
  })

  const activeCount = computed(() => agents.value.filter((a) => a.status === "Active").length)
  const totalRuns = computed(() => agents.value.reduce((sum, a) => sum + a.runs, 0))
  const avgAccuracy = computed(() => {
    if (agents.value.length === 0) return 0
    return agents.value.reduce((sum, a) => sum + a.accuracy, 0) / agents.value.length
  })

  const isEmpty = computed(() => !pending.value && total.value === 0)

  const loadError = computed(() =>
    error.value ? "Could not load your agents. Please try again." : "",
  )

  const formatRuns = (n: number) => n.toLocaleString("en-US")

  const accuracyTone = (value: number) =>
    value >= 96 ? "bg-[#16A34A]" : value >= 93 ? "bg-[#273BE2]" : "bg-[#D97706]"

  return {
    agents,
    total,
    query,
    statusFilters,
    statusFilter,
    filtered,
    activeCount,
    totalRuns,
    avgAccuracy,
    pending,
    error: loadError,
    refresh,
    isEmpty,
    formatRuns,
    accuracyTone,
  }
}
