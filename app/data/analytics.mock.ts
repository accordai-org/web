export type AgentOwner = 'mine' | 'community'
export type RangeDays = 7 | 30 | 90
export type Scope = 'all' | 'mine' | 'community'
export type Granularity = 'day' | 'week'

export interface AgentMeta {
  id: string
  name: string
  owner: AgentOwner
  status: 'Active' | 'Paused'
  avgTokensPerRun: number
  successRate: number
  /** Share of daily runs, should roughly sum to 1 */
  weight: number
  trendPct: number
}

export interface DayCell {
  tokens: number
  runs: number
}

export interface DailyPoint {
  /** ISO date yyyy-mm-dd */
  date: string
  label: string
  byAgent: Record<string, DayCell>
}

/** Cost model is illustrative until pricing lands. */
export const MOCK_RATE_PER_1K_TOKENS = 0.015
export const PRICING_PENDING = true

export const AGENTS: AgentMeta[] = [
  { id: 'inbox-triage', name: 'Inbox triage', owner: 'mine', status: 'Active', avgTokensPerRun: 980, successRate: 98.1, weight: 0.36, trendPct: 8.2 },
  { id: 'pr-reviewer', name: 'PR reviewer', owner: 'mine', status: 'Active', avgTokensPerRun: 1450, successRate: 97.4, weight: 0.26, trendPct: 14.6 },
  { id: 'competitor-watch', name: 'Competitor watch', owner: 'mine', status: 'Paused', avgTokensPerRun: 720, successRate: 95.8, weight: 0.1, trendPct: -6.3 },
  { id: 'meeting-notes', name: 'Meeting notes', owner: 'community', status: 'Active', avgTokensPerRun: 1100, successRate: 98.6, weight: 0.16, trendPct: 5.1 },
  { id: 'research-digest', name: 'Research digest', owner: 'community', status: 'Active', avgTokensPerRun: 1680, successRate: 96.9, weight: 0.12, trendPct: 21.4 },
]

/** Deterministic PRNG soSSR + client render the same series. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

function shortLabel(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const rand = mulberry32(20260906)
const agentNoise: Record<string, number[]> = {}
for (const a of AGENTS) {
  agentNoise[a.id] = Array.from({ length: 90 }, () => 0.7 + rand() * 0.6)
}

/** 90 days of per-agent runs/tokens, ending today. Weekday-heavy, weekend dip, gentle growth. */
export const DAILY: DailyPoint[] = (() => {
  const days: DailyPoint[] = []
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dow = d.getDay()
    const weekend = dow === 0 || dow === 6
    const season = weekend ? 0.45 : 1 + 0.12 * Math.sin(((89 - i) / 7) * Math.PI * 2)
    const growth = 1 + ((89 - i) / 89) * 0.35
    const base = 34 * season * growth
    const byAgent: Record<string, DayCell> = {}
    for (const a of AGENTS) {
      const noise = agentNoise[a.id]![89 - i]!
      const runs = Math.max(0, Math.round(base * a.weight * noise))
      byAgent[a.id] = { runs, tokens: Math.round(runs * a.avgTokensPerRun * (0.9 + noise * 0.2)) }
    }
    days.push({ date: toISO(d), label: shortLabel(d), byAgent })
  }
  return days
})()

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}K`
  return `${Math.round(n)}`
}

export function formatInt(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

export function formatCost(tokens: number): string {
  return `$${((tokens / 1000) * MOCK_RATE_PER_1K_TOKENS).toFixed(2)}`
}
