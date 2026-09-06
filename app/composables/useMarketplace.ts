import { computed } from "vue"
import {
  Bot,
  Calendar,
  Code,
  Globe,
  Mail,
  MessageSquare,
  Music,
  PenLine,
  Search,
  Zap,
  type LucideIcon,
} from "@lucide/vue"

export interface MarketplaceAgent {
  id: string
  name: string
  type: string
  description: string
  users: string
  author: string
  initials: string
}

export interface MarketplaceAgentVisual extends MarketplaceAgent {
  icon: LucideIcon
  tile: string
  iconColor: string
}

interface AgentVisual {
  icon: LucideIcon
  tile: string
  iconColor: string
}

/** Card artwork derived from the agent type — the backend only sends strings. */
const TYPE_VISUALS: Record<string, AgentVisual> = {
  Support: { icon: MessageSquare, tile: "bg-[#E8ECFF]", iconColor: "text-[#273BE2]" },
  Coding: { icon: Code, tile: "bg-[#E5F6EC]", iconColor: "text-[#1C7A43]" },
  Writing: { icon: PenLine, tile: "bg-[#FDF1E3]", iconColor: "text-[#B25E09]" },
  Research: { icon: Search, tile: "bg-[#EDE9FE]", iconColor: "text-[#6D28D9]" },
  Productivity: { icon: Mail, tile: "bg-[#E0F2F7]", iconColor: "text-[#0E7490]" },
  Data: { icon: Globe, tile: "bg-[#F3E8FF]", iconColor: "text-[#A21CAF]" },
  Team: { icon: Calendar, tile: "bg-[#FFE9E9]", iconColor: "text-[#C2410C]" },
  Fun: { icon: Music, tile: "bg-[#E7F9EF]", iconColor: "text-[#047857]" },
  Automation: { icon: Zap, tile: "bg-[#FFF7D6]", iconColor: "text-[#A16207]" },
}

const FALLBACK_VISUAL: AgentVisual = {
  icon: Bot,
  tile: "bg-[#F1F1F1]",
  iconColor: "text-[#6B6B6B]",
}

export function marketplaceVisual(type: string): AgentVisual {
  return TYPE_VISUALS[type] ?? FALLBACK_VISUAL
}

const textOf = (value: unknown): string => (typeof value === "string" ? value : "")

function normalizeAgent(item: Record<string, unknown>): MarketplaceAgent | null {
  const name = textOf(item.name).trim().slice(0, 120)
  const id = textOf(item.id).trim().slice(0, 120)
  if (id === "" || name === "") return null
  return {
    id,
    name,
    type: textOf(item.type).trim().slice(0, 60) || "Agent",
    description: textOf(item.description).trim().slice(0, 500),
    users: textOf(item.users).trim().slice(0, 20) || "0",
    author: textOf(item.author).trim().slice(0, 60) || "Community",
    initials: textOf(item.initials).trim().slice(0, 4).toUpperCase() || "AG",
  }
}

function normalizeList(input: unknown): MarketplaceAgent[] {
  const list = Array.isArray(input)
    ? input
    : input && typeof input === "object" && Array.isArray((input as { agents?: unknown }).agents)
      ? (input as { agents: unknown[] }).agents
      : []
  return list
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map(normalizeAgent)
    .filter((agent): agent is MarketplaceAgent => agent !== null)
}

/**
 * Marketplace list state.
 *
 * Chain: `marketplace.vue` page -> this composable -> `/api/marketplace/agents`
 * (Nitro, holds the backend secret) -> FastAPI `{backend}/v1/marketplace/agents`.
 */
export function useMarketplace() {
  const { data, pending, error, refresh } = useAsyncData("marketplace-agents", () =>
    $fetch<{ agents?: unknown[] } | unknown[]>("/api/marketplace/agents"),
  )

  const agents = computed<MarketplaceAgentVisual[]>(() =>
    normalizeList(data.value).map((agent) => ({ ...agent, ...marketplaceVisual(agent.type) })),
  )

  const isEmpty = computed(() => !pending.value && agents.value.length === 0)

  const loadError = computed(() =>
    error.value ? "Could not load the marketplace. Please try again." : "",
  )

  return { agents, pending, error: loadError, refresh, isEmpty }
}
