<script setup lang="ts">
definePageMeta({ layout: 'use' })

import { useAgentDetail } from '~/composables/useAgentDetail'

const route = useRoute()
const agentId = computed(() => route.params.id as string)

// Live detail: page -> useAgentDetail -> /api/agents/:id -> FastAPI.
const { agent, pending, error, isNotFound, stats, refresh } = useAgentDetail(agentId)
</script>

<template>
  <div class="font-sans unmodified-font-sans p-6">
    <NuxtLink to="/use/my-agents" class="unmodified-font-sans text-xs text-[#6B6B6B] no-underline hover:text-[#121212]">← My agents</NuxtLink>
    <!-- Loading -->
    <div v-if="pending" class="mt-2.5 flex flex-col gap-2.5" aria-label="Loading agent">
      <div class="h-7 w-1/3 rounded bg-[#EDEDED]" />
      <div class="h-4 w-2/3 rounded bg-[#F1F1F1]" />
      <div class="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
        <div v-for="n in 5" :key="n" class="h-[74px] rounded-[10px] border border-[#E3E3E3] bg-white" />
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="isNotFound" class="mt-2.5 rounded-[10px] border border-[#E3E3E3] bg-white px-4 py-12 text-center">
      <p class="unmodified-font-sans m-0 text-sm font-medium text-[#121212]">Agent not found</p>
      <p class="unmodified-font-sans m-0 mt-1 text-[13px] text-[#6B6B6B]">It may have been deleted, or the link is wrong.</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="mt-2.5 rounded-[10px] border border-[#E3E3E3] bg-white px-4 py-12 text-center">
      <p class="unmodified-font-sans m-0 text-sm font-medium text-[#121212]">Something went wrong</p>
      <p class="unmodified-font-sans m-0 mt-1 text-[13px] text-[#6B6B6B]">{{ error }}</p>
      <button
        type="button"
        class="unmodified-font-sans mt-3 cursor-pointer rounded-[9px] border-0 bg-[#121212] px-3 py-[7px] text-[13px] font-medium text-white"
        @click="refresh()"
      >
        Try again
      </button>
    </div>

    <template v-else-if="agent">
    <div class="mb-[18px] mt-2.5 flex items-start justify-between gap-3">
      <div>
        <h1 class="unmodified-font-sans m-0 mb-1 text-xl font-medium tracking-[-0.01em] text-[#121212]">{{ agent.name }}</h1>
        <p class="unmodified-font-sans m-0 text-sm text-[#6B6B6B]">{{ agent.desc }}</p>
      </div>
      <span class="shrink-0 rounded-full border border-[#E3E3E3] bg-white px-2.5 py-[3px] text-xs text-[#121212]">{{ agent.status }}</span>
    </div>

    <div class="mb-2.5 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
      <div
        v-for="s in stats"
        :key="s.label"
        class="flex flex-col gap-0.5 rounded-[10px] border border-[#E3E3E3] bg-white p-3.5"
      >
        <span class="unmodified-font-sans text-xl font-medium text-[#121212]">{{ s.value }}</span>
        <span class="unmodified-font-sans text-xs text-[#6B6B6B]">{{ s.label }}</span>
      </div>
    </div>

    <div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-2.5">
      <section class="rounded-[10px] border border-[#E3E3E3] bg-white p-3.5">
        <h2 class="unmodified-font-sans m-0 mb-2.5 text-[13px] font-medium text-[#121212]">Performance over time</h2>
        <div class="rounded-lg border border-dashed border-[#E3E3E3] px-3 py-7 text-center text-xs text-[#8A8A8A]">Chart placeholder</div>
      </section>
      <section class="rounded-[10px] border border-[#E3E3E3] bg-white p-3.5">
        <h2 class="unmodified-font-sans m-0 mb-2.5 text-[13px] font-medium text-[#121212]">Learning / improvement</h2>
        <div class="rounded-lg border border-dashed border-[#E3E3E3] px-3 py-7 text-center text-xs text-[#8A8A8A]">Improvement placeholder</div>
      </section>
      <section class="rounded-[10px] border border-[#E3E3E3] bg-white p-3.5">
        <h2 class="unmodified-font-sans m-0 mb-2.5 text-[13px] font-medium text-[#121212]">Learned memories / patterns</h2>
        <ul v-if="agent.memories.length > 0" class="unmodified-font-sans m-0 flex flex-col gap-1.5 pl-4 text-xs text-[#5F5F5F]">
          <li v-for="memory in agent.memories" :key="memory">{{ memory }}</li>
        </ul>
        <p v-else class="unmodified-font-sans m-0 text-xs text-[#8A8A8A]">No learned memories yet.</p>
      </section>
      <section class="rounded-[10px] border border-[#E3E3E3] bg-white p-3.5">
        <h2 class="unmodified-font-sans m-0 mb-2.5 text-[13px] font-medium text-[#121212]">Tool usage &amp; performance</h2>
        <ul v-if="agent.toolUsage.length > 0" class="unmodified-font-sans m-0 flex flex-col gap-1.5 pl-4 text-xs text-[#5F5F5F]">
          <li v-for="tool in agent.toolUsage" :key="tool.name">{{ tool.name }} — {{ tool.calls }} calls · {{ tool.successRate }} success</li>
        </ul>
        <p v-else class="unmodified-font-sans m-0 text-xs text-[#8A8A8A]">No tool usage yet.</p>
      </section>
      <section class="rounded-[10px] border border-[#E3E3E3] bg-white p-3.5">
        <h2 class="unmodified-font-sans m-0 mb-2.5 text-[13px] font-medium text-[#121212]">Run history</h2>
        <div class="rounded-lg border border-dashed border-[#E3E3E3] px-3 py-7 text-center text-xs text-[#8A8A8A]">Run list placeholder</div>
      </section>
      <section class="rounded-[10px] border border-[#E3E3E3] bg-white p-3.5">
        <h2 class="unmodified-font-sans m-0 mb-2.5 text-[13px] font-medium text-[#121212]">Deployment &amp; access</h2>
        <ul class="unmodified-font-sans m-0 flex flex-col gap-1.5 pl-4 text-xs text-[#5F5F5F]">
          <li>Deployment status: {{ agent.status }}</li>
          <li>API / MCP availability: coming soon</li>
        </ul>
      </section>
    </div>
    </template>
  </div>
</template>
