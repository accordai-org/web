<script setup lang="ts">
import type { RankedAgent } from '~/composables/useAnalytics'

defineProps<{
  title: string
  subtitle: string
  rows: RankedAgent[]
  emptyText: string
}>()

function trendClass(t: number) {
  return t < 0 ? 'text-[#16A34A]' : 'text-[#B42318]'
}
</script>

<template>
  <section class="rounded-[10px] border border-[#E3E3E3] bg-white p-3.5">
    <h2 class="unmodified-font-sans m-0 mb-0.5 text-[13px] font-medium text-[#121212]">{{ title }}</h2>
    <p class="unmodified-font-sans m-0 mb-3 text-xs text-[#8A8A8A]">{{ subtitle }}</p>
    <div v-if="rows.length === 0" class="rounded-lg border border-dashed border-[#E3E3E3] px-3 py-7 text-center text-xs text-[#8A8A8A]">
      {{ emptyText }}
    </div>
    <ol v-else class="m-0 flex list-none flex-col gap-2.5 p-0">
      <li v-for="(r, i) in rows" :key="r.id">
        <NuxtLink :to="`/use/my-agents/${r.id}`" class="group block no-underline">
          <div class="mb-1 flex items-baseline gap-2">
            <span class="unmodified-font-sans w-4 shrink-0 text-[11px] text-[#8A8A8A]">{{ i + 1 }}</span>
            <span
              class="h-1.5 w-1.5 shrink-0 self-center rounded-full"
              :class="r.status === 'Active' ? 'bg-[#16A34A]' : 'bg-[#8A8A8A]'"
            />
            <span class="unmodified-font-sans flex-1 truncate text-[13px] font-medium text-[#121212] group-hover:underline">
              {{ r.name }}
            </span>
            <span
              v-if="r.owner === 'community'"
              class="unmodified-font-sans shrink-0 rounded-full bg-[#F4F4F4] px-1.5 py-px text-[10px] text-[#6B6B6B]"
            >
              Community
            </span>
            <span class="unmodified-font-sans shrink-0 text-[11px] font-medium" :class="trendClass(r.trendPct)">
              {{ r.trendPct > 0 ? '↑' : '↓' }} {{ Math.abs(r.trendPct).toFixed(1) }}%
            </span>
          </div>
          <div class="mb-1 ml-6 h-1.5 overflow-hidden rounded-full bg-[#F4F4F4]">
            <div
              class="h-full rounded-full bg-[#121212] transition-all duration-500"
              :style="{ width: `${Math.max(3, r.share).toFixed(1)}%` }"
            />
          </div>
          <div class="unmodified-font-sans ml-6 flex items-baseline justify-between gap-2">
            <span class="text-[11px] text-[#6B6B6B]">{{ r.detail }}</span>
            <span class="text-[11px] font-medium text-[#121212]">{{ r.share.toFixed(0) }}%</span>
          </div>
        </NuxtLink>
      </li>
    </ol>
  </section>
</template>
