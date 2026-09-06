import { computed, ref, watch } from 'vue'
import {
  AGENTS,
  DAILY,
  PRICING_PENDING,
  formatCost,
  formatInt,
  formatTokens,
  type DailyPoint,
  type Granularity,
  type RangeDays,
  type Scope,
} from '~/data/analytics.mock'

export interface Bucket {
  label: string
  tokens: number
  runs: number
}

export interface ForecastPoint {
  label: string
  value: number
  low: number
  high: number
}

export interface RankedAgent {
  id: string
  name: string
  status: string
  owner: 'mine' | 'community'
  runs: number
  tokens: number
  share: number
  trendPct: number
  detail: string
}

const FORECAST_DAYS = 14

export function useAnalytics() {
  const rangeDays = ref<RangeDays>(30)
  const scope = ref<Scope>('all')
  const granularity = ref<Granularity>('day')

  // Default week view for the long range; user can still toggle back.
  watch(rangeDays, (r) => {
    granularity.value = r === 90 ? 'week' : 'day'
  })

  const agentsInScope = computed(() =>
    AGENTS.filter((a) => scope.value === 'all' || a.owner === scope.value),
  )
  const agentIds = computed(() => new Set(agentsInScope.value.map((a) => a.id)))

  const window_ = computed<DailyPoint[]>(() => DAILY.slice(-rangeDays.value))

  const inScope = (d: DailyPoint) => {
    const ids = agentIds.value
    let tokens = 0
    let runs = 0
    for (const [id, cell] of Object.entries(d.byAgent)) {
      if (ids.has(id)) {
        tokens += cell.tokens
        runs += cell.runs
      }
    }
    return { tokens, runs }
  }

  const totals = computed(() => {
    let tokens = 0
    let runs = 0
    for (const d of window_.value) {
      const s = inScope(d)
      tokens += s.tokens
      runs += s.runs
    }
    // Prior-period comparison: the slice just before the window.
    let prevTokens = 0
    let prevRuns = 0
    const prev = DAILY.slice(-rangeDays.value * 2, -rangeDays.value)
    for (const d of prev) {
      const s = inScope(d)
      prevTokens += s.tokens
      prevRuns += s.runs
    }
    const pct = (cur: number, prev_: number) =>
      prev_ === 0 ? 0 : ((cur - prev_) / prev_) * 100
    return {
      tokens,
      runs,
      avgPerRun: runs === 0 ? 0 : tokens / runs,
      cost: formatCost(tokens),
      tokensDelta: pct(tokens, prevTokens),
      runsDelta: pct(runs, prevRuns),
      activeAgents: agentsInScope.value.filter((a) => a.status === 'Active').length,
      totalAgents: agentsInScope.value.length,
    }
  })

  /** Day- or week-aggregated buckets for the selected window. */
  const buckets = computed<Bucket[]>(() => {
    const days = window_.value.map((d) => ({ label: d.label, ...inScope(d) }))
    if (granularity.value === 'day' || days.length <= 14) return days
    const out: Bucket[] = []
    for (let i = 0; i < days.length; i += 7) {
      const chunk = days.slice(i, i + 7)
      out.push({
        label: `Wk of ${chunk[0]!.label}`,
        tokens: chunk.reduce((s, c) => s + c.tokens, 0),
        runs: chunk.reduce((s, c) => s + c.runs, 0),
      })
    }
    return out
  })

  /** Forecast from the trailing 7-day moving average, ±15% band. */
  const forecast = computed<ForecastPoint[]>(() => {
    const days = window_.value.map(inScope)
    const tail = days.slice(-7)
    const avg = tail.reduce((s, d) => s + d.tokens, 0) / Math.max(1, tail.length)
    const last = window_.value[window_.value.length - 1]?.date ?? ''
    return Array.from({ length: FORECAST_DAYS }, (_, i) => {
      const d = new Date(`${last}T12:00:00`)
      d.setDate(d.getDate() + i + 1)
      const value = Math.round(avg * (1 + i * 0.004))
      return {
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value,
        low: Math.round(value * 0.85),
        high: Math.round(value * 1.15),
      }
    })
  })

  const rank = (by: 'runs' | 'tokens'): RankedAgent[] => {
    const rows = agentsInScope.value.map((a) => {
      let runs = 0
      let tokens = 0
      for (const d of window_.value) {
        runs += d.byAgent[a.id]?.runs ?? 0
        tokens += d.byAgent[a.id]?.tokens ?? 0
      }
      return { meta: a, runs, tokens }
    })
    const total = rows.reduce((s, r) => s + (by === 'runs' ? r.runs : r.tokens), 0)
    return rows
      .sort((x, y) => (by === 'runs' ? y.runs - x.runs : y.tokens - x.tokens))
      .slice(0, 5)
      .map((r) => ({
        id: r.meta.id,
        name: r.meta.name,
        status: r.meta.status,
        owner: r.meta.owner,
        runs: r.runs,
        tokens: r.tokens,
        share: total === 0 ? 0 : (by === 'runs' ? r.runs / total : r.tokens / total) * 100,
        trendPct: r.meta.trendPct,
        detail:
          by === 'runs'
            ? `${formatInt(r.runs)} runs · ${formatTokens(r.tokens)} tokens`
            : `${formatTokens(r.tokens)} tokens · ${formatInt(r.runs)} runs`,
      }))
  }

  const topByRuns = computed(() => rank('runs'))
  const topByTokens = computed(() => rank('tokens'))

  const split = computed(() => {
    let mine = 0
    let community = 0
    for (const d of window_.value) {
      for (const [id, cell] of Object.entries(d.byAgent)) {
        const owner = AGENTS.find((a) => a.id === id)?.owner
        if (owner === 'mine') mine += cell.tokens
        else if (owner === 'community') community += cell.tokens
      }
    }
    const total = mine + community
    return {
      mine,
      community,
      minePct: total === 0 ? 0 : (mine / total) * 100,
      communityPct: total === 0 ? 0 : (community / total) * 100,
    }
  })

  const insight = computed(() => {
    const t = totals.value
    const daily = t.tokens / Math.max(1, rangeDays.value)
    const projected = Math.round(daily * 30)
    const top = topByTokens.value[0]
    const burn = `${formatTokens(daily)}/day`
    return `Burning ~${burn} over the last ${rangeDays.value} days — on pace for ~${formatTokens(projected)} tokens this month.${top ? ` Highest burn: ${top.name} (${formatTokens(top.tokens)}, ${top.share.toFixed(0)}% share).` : ''}`
  })

  return {
    rangeDays,
    scope,
    granularity,
    totals,
    buckets,
    forecast,
    topByRuns,
    topByTokens,
    split,
    insight,
    pricingPending: PRICING_PENDING,
    formatTokens,
    formatInt,
    formatCost,
  }
}
