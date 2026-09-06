<script setup lang="ts">
import { computed } from 'vue'
import { formatTokens } from '~/data/analytics.mock'

const props = defineProps<{
  mine: number
  community: number
  minePct: number
  communityPct: number
}>()

const R = 44
const C = 2 * Math.PI * R
const mineLen = computed(() => (props.minePct / 100) * C)
</script>

<template>
  <section class="rounded-[10px] border border-[#E3E3E3] bg-white p-3.5">
    <h2 class="unmodified-font-sans m-0 mb-0.5 text-[13px] font-medium text-[#121212]">Where tokens go</h2>
    <p class="unmodified-font-sans m-0 mb-3 text-xs text-[#8A8A8A]">Your agents vs community agents you run.</p>
    <div class="flex items-center gap-4">
      <svg viewBox="0 0 110 110" class="h-[110px] w-[110px] shrink-0 -rotate-90" role="img" aria-label="Token ownership split">
        <circle cx="55" cy="55" :r="R" fill="none" stroke="#F4F4F4" :stroke-width="12" />
        <circle
          cx="55"
          cy="55"
          :r="R"
          fill="none"
          stroke="#121212"
          :stroke-width="12"
          stroke-linecap="round"
          :stroke-dasharray="`${mineLen} ${C}`"
        />
      </svg>
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 shrink-0 rounded-full bg-[#121212]" />
          <span class="unmodified-font-sans flex-1 truncate text-xs text-[#5F5F5F]">My agents</span>
          <span class="unmodified-font-sans text-xs font-medium text-[#121212]">{{ formatTokens(mine) }} · {{ minePct.toFixed(0) }}%</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 shrink-0 rounded-full bg-[#E3E3E3]" />
          <span class="unmodified-font-sans flex-1 truncate text-xs text-[#5F5F5F]">Community</span>
          <span class="unmodified-font-sans text-xs font-medium text-[#121212]">{{ formatTokens(community) }} · {{ communityPct.toFixed(0) }}%</span>
        </div>
        <div class="mt-1 flex items-center gap-2 rounded-[8px] bg-[#FAFAFA] px-2 py-1.5 opacity-70">
          <span class="unmodified-font-sans flex-1 text-[11px] text-[#6B6B6B]">Earnings from others running your agents</span>
          <span class="unmodified-font-sans rounded-full bg-[#F4F4F4] px-1.5 py-px text-[10px] font-medium text-[#6B6B6B]">Pricing soon</span>
        </div>
      </div>
    </div>
  </section>
</template>
