<script setup lang="ts">
import { Lightbulb } from '@lucide/vue'
import type { Granularity, RangeDays, Scope } from '~/data/analytics.mock'

definePageMeta({ layout: 'use' })

const {
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
  pricingPending,
  formatTokens,
  formatInt,
} = useAnalytics()

const ranges: { label: string; value: RangeDays }[] = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
]
const scopes: { label: string; value: Scope }[] = [
  { label: 'All', value: 'all' },
  { label: 'Mine', value: 'mine' },
  { label: 'Community', value: 'community' },
]
const granularities: { label: string; value: Granularity }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
]

function deltaSub(delta: number) {
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)}% vs prior ${rangeDays.value}d`
}

const tokenPoints = computed(() => buckets.value.map((b) => ({ label: b.label, value: b.tokens })))
const runPoints = computed(() => buckets.value.map((b) => ({ label: b.label, value: b.runs })))
</script>

<template>
  <div class="font-sans unmodified-font-sans p-6">
    <div class="mb-[18px] flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="unmodified-font-sans m-0 mb-1 text-xl font-medium tracking-[-0.01em] text-[#121212]">Analytics</h1>
        <p class="unmodified-font-sans m-0 text-sm text-[#6B6B6B]">Token spend, usage and forecast across your workspace.</p>
      </div>
      <div class="flex flex-wrap items-center gap-1.5">
        <div class="flex items-center gap-0.5 rounded-[10px] border border-[#E3E3E3] bg-white p-0.5">
          <button
            v-for="s in scopes"
            :key="s.value"
            type="button"
            class="unmodified-font-sans rounded-[7px] px-2.5 py-1 text-xs font-medium transition-colors duration-100"
            :class="scope === s.value ? 'bg-[#121212] text-white' : 'text-[#6B6B6B] hover:text-[#121212]'"
            @click="scope = s.value"
          >
            {{ s.label }}
          </button>
        </div>
        <div class="flex items-center gap-0.5 rounded-[10px] border border-[#E3E3E3] bg-white p-0.5">
          <button
            v-for="r in ranges"
            :key="r.value"
            type="button"
            class="unmodified-font-sans rounded-[7px] px-2.5 py-1 text-xs font-medium transition-colors duration-100"
            :class="rangeDays === r.value ? 'bg-[#121212] text-white' : 'text-[#6B6B6B] hover:text-[#121212]'"
            @click="rangeDays = r.value"
          >
            {{ r.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="mb-2.5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
      <AnalyticsKpiCard label="Total tokens" :value="formatTokens(totals.tokens)" :sub="deltaSub(totals.tokensDelta)" />
      <AnalyticsKpiCard label="Total spend" :value="totals.cost" :sub="pricingPending ? 'Estimated · billing not live' : undefined" pending />
      <AnalyticsKpiCard label="Total runs" :value="formatInt(totals.runs)" :sub="deltaSub(totals.runsDelta)" />
      <AnalyticsKpiCard :label="`Active agents · ${scope === 'all' ? 'all' : scope}`" :value="`${totals.activeAgents}`" :sub="`of ${totals.totalAgents} in scope`" />
      <AnalyticsKpiCard label="Avg tokens / run" :value="formatTokens(totals.avgPerRun)" sub="Efficiency signal" />
    </div>

    <section class="mb-2.5 rounded-[10px] border border-[#E3E3E3] bg-white p-3.5">
      <div class="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 class="unmodified-font-sans m-0 mb-0.5 text-[13px] font-medium text-[#121212]">Token spend over time</h2>
          <p class="unmodified-font-sans m-0 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#8A8A8A]">
            <span class="inline-flex items-center gap-1"><span class="inline-block h-0.5 w-4 rounded bg-[#121212]" /> Actual</span>
            <span class="inline-flex items-center gap-1"><span class="inline-block h-0 w-4 border-t-2 border-dashed border-[#273BE2]" /> Projected · 14d</span>
          </p>
        </div>
        <div class="flex items-center gap-0.5 rounded-[10px] border border-[#E3E3E3] bg-[#FAFAFA] p-0.5">
          <button
            v-for="g in granularities"
            :key="g.value"
            type="button"
            class="unmodified-font-sans rounded-[7px] px-2.5 py-1 text-xs font-medium transition-colors duration-100"
            :class="granularity === g.value ? 'bg-white text-[#121212] shadow-sm' : 'text-[#6B6B6B] hover:text-[#121212]'"
            @click="granularity = g.value"
          >
            {{ g.label }}
          </button>
        </div>
      </div>
      <AnalyticsTokenChart :points="tokenPoints" :forecast="forecast" :format-value="formatTokens" />
    </section>

    <div class="mb-2.5 flex items-start gap-2 rounded-[10px] border border-[#E3E3E3] bg-white px-3.5 py-3">
      <Lightbulb :size="15" :stroke-width="1.8" class="mt-px shrink-0 text-[#273BE2]" />
      <p class="unmodified-font-sans m-0 text-xs leading-5 text-[#5F5F5F]">{{ insight }}</p>
    </div>

    <div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-2.5">
      <AnalyticsTopAgents
        title="Most used agents"
        subtitle="Ranked by runs in the selected period."
        :rows="topByRuns"
        empty-text="No runs in this scope yet."
      />
      <AnalyticsTopAgents
        title="Highest token spend"
        subtitle="Where your token budget actually goes."
        :rows="topByTokens"
        empty-text="No token usage in this scope yet."
      />
      <AnalyticsSplitDonut
        :mine="split.mine"
        :community="split.community"
        :mine-pct="split.minePct"
        :community-pct="split.communityPct"
      />
      <section class="rounded-[10px] border border-[#E3E3E3] bg-white p-3.5">
        <h2 class="unmodified-font-sans m-0 mb-0.5 text-[13px] font-medium text-[#121212]">Runs over time</h2>
        <p class="unmodified-font-sans m-0 mb-2 text-xs text-[#8A8A8A]">Volume behind the token curve.</p>
        <AnalyticsTokenChart :points="runPoints" :format-value="formatInt" />
      </section>
    </div>
  </div>
</template>
