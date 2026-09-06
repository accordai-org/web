<script setup lang="ts">
definePageMeta({ layout: 'use' })
const agents = [
  { id: 'inbox-triage', name: 'Inbox triage', status: 'Active', runs: '1,204' },
  { id: 'pr-reviewer', name: 'PR reviewer', status: 'Active', runs: '862' },
  { id: 'competitor-watch', name: 'Competitor watch', status: 'Paused', runs: '319' },
]
</script>

<template>
  <div class="font-sans unmodified-font-sans p-6">
    <h1 class="unmodified-font-sans m-0 mb-1 text-xl font-medium tracking-[-0.01em] text-[#121212]">My agents</h1>
    <p class="unmodified-font-sans m-0 mb-[18px] text-sm text-[#6B6B6B]">Agents you have created or installed.</p>
    <div class="flex flex-col gap-1.5">
      <NuxtLink
        v-for="a in agents"
        :key="a.id"
        :to="`/use/my-agents/${a.id}`"
        class="flex items-center gap-2.5 rounded-[10px] border border-[#E3E3E3] bg-white px-3.5 py-3 no-underline transition-colors duration-100 hover:bg-[#EBEBEB]"
      >
        <span
          class="h-2 w-2 shrink-0 rounded-full"
          :class="a.status === 'Active' ? 'bg-[#16A34A]' : 'bg-[#8A8A8A]'"
        />
        <span class="unmodified-font-sans flex-1 font-medium text-[#121212]">{{ a.name }}</span>
        <span class="unmodified-font-sans text-xs text-[#6B6B6B] max-sm:hidden">{{ a.status }} · {{ a.runs }} runs</span>
        <span class="unmodified-font-sans cursor-pointer rounded-[8px] border border-[#E3E3E3] bg-transparent px-2.5 py-[5px] text-xs text-[#121212]">Open →</span>
      </NuxtLink>
    </div>
  </div>
</template>
