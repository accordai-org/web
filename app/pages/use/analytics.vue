<script setup lang="ts">
definePageMeta({ layout: 'use' })
const stats = [
  { label: 'Total runs', value: '2,385' },
  { label: 'Success rate', value: '97.2%' },
  { label: 'Avg latency', value: '1.8s' },
  { label: 'Active agents', value: '3' },
]
</script>

<template>
  <div class="font-sans unmodified-font-sans p-6">
    <h1 class="unmodified-font-sans m-0 mb-1 text-xl font-medium tracking-[-0.01em] text-[#121212]">Analytics</h1>
    <p class="unmodified-font-sans m-0 mb-[18px] text-sm text-[#6B6B6B]">Usage and performance across your workspace.</p>
    <div class="mb-2.5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
      <div
        v-for="s in stats"
        :key="s.label"
        class="flex flex-col gap-0.5 rounded-[10px] border border-[#E3E3E3] bg-white p-3.5"
      >
        <span class="unmodified-font-sans text-xl font-medium text-[#121212]">{{ s.value }}</span>
        <span class="unmodified-font-sans text-xs text-[#6B6B6B]">{{ s.label }}</span>
      </div>
    </div>
    <div class="rounded-[10px] border border-dashed border-[#E3E3E3] bg-white px-4 py-12 text-center text-[13px] text-[#8A8A8A]">
      Runs over time — chart placeholder
    </div>
  </div>
</template>
