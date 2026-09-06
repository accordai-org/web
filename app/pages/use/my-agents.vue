<script setup lang="ts">
definePageMeta({ layout: 'use' })

import { computed, ref } from 'vue'
import { ChevronRight, Globe, Lock, Plus, Search } from '@lucide/vue'

type Agent = {
  id: string
  name: string
  desc: string
  visibility: 'Public' | 'Private'
  status: 'Active' | 'Paused'
  accuracy: number
  runs: number
  lastRun: string
  color: string
  initial: string
}

const agents: Agent[] = [
  {
    id: 'inbox-triage',
    name: 'Inbox triage',
    desc: 'Drafts replies to partnership requests from your inbox.',
    visibility: 'Private',
    status: 'Active',
    accuracy: 98.1,
    runs: 1204,
    lastRun: '12 min ago',
    color: '#273BE2',
    initial: 'I',
  },
  {
    id: 'pr-reviewer',
    name: 'PR reviewer',
    desc: 'Reviews every PR against your style guide and flags risks.',
    visibility: 'Public',
    status: 'Active',
    accuracy: 96.4,
    runs: 862,
    lastRun: '1 hr ago',
    color: '#0E7C5B',
    initial: 'P',
  },
  {
    id: 'competitor-watch',
    name: 'Competitor watch',
    desc: 'Tracks competitor launches and summarises what changed.',
    visibility: 'Private',
    status: 'Paused',
    accuracy: 93.8,
    runs: 319,
    lastRun: '6 days ago',
    color: '#8A5A00',
    initial: 'C',
  },
]

const query = ref('')
const statusFilters = ['All', 'Active', 'Paused'] as const
const statusFilter = ref<(typeof statusFilters)[number]>('All')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return agents.filter((a) => {
    const matchesStatus = statusFilter.value === 'All' || a.status === statusFilter.value
    const matchesQuery
      = q === ''
        || a.name.toLowerCase().includes(q)
        || a.desc.toLowerCase().includes(q)
    return matchesStatus && matchesQuery
  })
})

const activeCount = computed(() => agents.filter((a) => a.status === 'Active').length)
const totalRuns = computed(() => agents.reduce((sum, a) => sum + a.runs, 0))
const avgAccuracy = computed(() => {
  if (agents.length === 0) return 0
  return agents.reduce((sum, a) => sum + a.accuracy, 0) / agents.length
})

const formatRuns = (n: number) => n.toLocaleString('en-US')

const accuracyTone = (value: number) =>
  value >= 96 ? 'bg-[#16A34A]' : value >= 93 ? 'bg-[#273BE2]' : 'bg-[#D97706]'
</script>

<template>
  <div class="font-sans unmodified-font-sans mx-auto w-full max-w-[960px] p-6">
    <!-- Header -->
    <div class="mb-4 flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="unmodified-font-sans m-0 mb-1 flex items-center gap-2 text-xl font-medium tracking-[-0.01em] text-[#121212]">
          My agents
          <span class="unmodified-font-sans rounded-full border border-[#E3E3E3] bg-white px-2 py-[1px] text-xs font-normal text-[#6B6B6B]">
            {{ agents.length }}
          </span>
        </h1>
        <p class="unmodified-font-sans m-0 text-sm text-[#6B6B6B]">Agents you have created or installed.</p>
      </div>
      <NuxtLink
        to="/use/agent"
        class="unmodified-font-sans flex shrink-0 items-center gap-1.5 rounded-[9px] bg-[#121212] px-3 py-[7px] text-[13px] font-medium text-white no-underline transition-colors duration-100 hover:bg-[#2A2A2A]"
      >
        <Plus :size="14" :stroke-width="2" />
        New agent
      </NuxtLink>
    </div>

    <!-- Summary strip -->
    <div class="mb-3 grid grid-cols-3 gap-2.5">
      <div class="rounded-[10px] border border-[#E3E3E3] bg-white px-3.5 py-3">
        <div class="unmodified-font-sans text-lg font-medium leading-tight text-[#121212]">{{ activeCount }}</div>
        <div class="unmodified-font-sans mt-0.5 text-xs text-[#6B6B6B]">Active agents</div>
      </div>
      <div class="rounded-[10px] border border-[#E3E3E3] bg-white px-3.5 py-3">
        <div class="unmodified-font-sans text-lg font-medium leading-tight text-[#121212]">{{ formatRuns(totalRuns) }}</div>
        <div class="unmodified-font-sans mt-0.5 text-xs text-[#6B6B6B]">Total runs</div>
      </div>
      <div class="rounded-[10px] border border-[#E3E3E3] bg-white px-3.5 py-3">
        <div class="unmodified-font-sans text-lg font-medium leading-tight text-[#121212]">{{ avgAccuracy.toFixed(1) }}%</div>
        <div class="unmodified-font-sans mt-0.5 text-xs text-[#6B6B6B]">Avg accuracy</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="mb-2.5 flex items-center gap-2 max-sm:flex-col max-sm:items-stretch">
      <div class="relative min-w-0 flex-1">
        <Search :size="14" :stroke-width="1.8" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
        <input
          v-model="query"
          type="text"
          placeholder="Search agents…"
          class="unmodified-font-sans w-full rounded-[9px] border border-[#E3E3E3] bg-white py-[7px] pl-8.5 pr-3 text-[13px] text-[#121212] outline-none transition-colors placeholder:text-[#8A8A8A] focus:border-[#121212]"
        />
      </div>
      <div class="flex shrink-0 items-center gap-1 rounded-[9px] border border-[#E3E3E3] bg-white p-1">
        <button
          v-for="f in statusFilters"
          :key="f"
          type="button"
          class="unmodified-font-sans cursor-pointer rounded-[6px] border-0 px-2.5 py-[4px] text-xs transition-colors duration-100"
          :class="statusFilter === f ? 'bg-[#121212] font-medium text-white' : 'bg-transparent font-normal text-[#6B6B6B] hover:text-[#121212]'"
          @click="statusFilter = f"
        >
          {{ f }}
        </button>
      </div>
    </div>

    <!-- List -->
    <div class="overflow-hidden rounded-[12px] border border-[#E3E3E3] bg-white">
      <!-- Column headers (desktop) -->
      <div class="hidden grid-cols-[minmax(0,1fr)_96px_132px_88px_108px_20px] items-center gap-3 border-b border-[#E3E3E3] bg-[#FAFAFA] px-4 py-2 md:grid">
        <span class="unmodified-font-sans text-[11px] font-medium uppercase tracking-[0.06em] text-[#8A8A8A]">Agent</span>
        <span class="unmodified-font-sans text-[11px] font-medium uppercase tracking-[0.06em] text-[#8A8A8A]">Status</span>
        <span class="unmodified-font-sans text-[11px] font-medium uppercase tracking-[0.06em] text-[#8A8A8A]">Accuracy</span>
        <span class="unmodified-font-sans text-right text-[11px] font-medium uppercase tracking-[0.06em] text-[#8A8A8A]">Runs</span>
        <span class="unmodified-font-sans text-right text-[11px] font-medium uppercase tracking-[0.06em] text-[#8A8A8A]">Last run</span>
        <span />
      </div>

      <div v-if="filtered.length > 0" class="flex flex-col divide-y divide-[#EDEDED]">
        <NuxtLink
          v-for="a in filtered"
          :key="a.id"
          :to="`/use/my-agents/${a.id}`"
          class="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 no-underline transition-colors duration-100 hover:bg-[#F4F4F4] md:grid-cols-[minmax(0,1fr)_96px_132px_88px_108px_20px]"
        >
          <!-- Agent identity -->
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[15px] font-medium text-white"
              :style="{ backgroundColor: a.color }"
            >
              {{ a.initial }}
            </div>
            <div class="min-w-0">
              <div class="flex min-w-0 items-center gap-1.5">
                <span class="unmodified-font-sans truncate text-[14px] font-medium text-[#121212]">{{ a.name }}</span>
                <!-- Visibility pill -->
                <span
                  class="unmodified-font-sans flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-[1px] text-[11px] font-medium leading-[1.4]"
                  :class="a.visibility === 'Public' ? 'border-[#C9D2FF] bg-[#EEF1FF] text-[#273BE2]' : 'border-[#E3E3E3] bg-[#F4F4F4] text-[#6B6B6B]'"
                >
                  <component :is="a.visibility === 'Public' ? Globe : Lock" :size="10" :stroke-width="2" />
                  {{ a.visibility }}
                </span>
              </div>
              <p class="unmodified-font-sans m-0 mt-0.5 truncate text-[13px] text-[#6B6B6B]">{{ a.desc }}</p>
              <!-- Compact meta (mobile only) -->
              <p class="unmodified-font-sans m-0 mt-1 text-xs text-[#8A8A8A] md:hidden">
                {{ a.status }} · {{ a.accuracy.toFixed(1) }}% acc · {{ formatRuns(a.runs) }} runs · {{ a.lastRun }}
              </p>
            </div>
          </div>

          <!-- Status -->
          <div class="hidden items-center gap-1.5 md:flex">
            <span
              class="h-[7px] w-[7px] shrink-0 rounded-full"
              :class="a.status === 'Active' ? 'bg-[#16A34A]' : 'bg-[#8A8A8A]'"
            />
            <span class="unmodified-font-sans text-[13px]" :class="a.status === 'Active' ? 'text-[#121212]' : 'text-[#6B6B6B]'">
              {{ a.status }}
            </span>
          </div>

          <!-- Accuracy -->
          <div class="hidden items-center gap-2 md:flex">
            <div class="h-1 w-14 shrink-0 overflow-hidden rounded-full bg-[#EBEBEB]">
              <div class="h-full rounded-full" :class="accuracyTone(a.accuracy)" :style="{ width: `${a.accuracy}%` }" />
            </div>
            <span class="unmodified-font-sans text-[13px] font-medium tabular-nums text-[#121212]">{{ a.accuracy.toFixed(1) }}%</span>
          </div>

          <!-- Runs -->
          <div class="unmodified-font-sans hidden text-right text-[13px] tabular-nums text-[#121212] md:block">
            {{ formatRuns(a.runs) }}
          </div>

          <!-- Last run -->
          <div class="unmodified-font-sans hidden truncate text-right text-[13px] text-[#6B6B6B] md:block">
            {{ a.lastRun }}
          </div>

          <ChevronRight
            :size="15"
            :stroke-width="1.8"
            class="justify-self-end text-[#8A8A8A] transition-all duration-100 group-hover:translate-x-0.5 group-hover:text-[#121212]"
          />
        </NuxtLink>
      </div>

      <!-- Empty state -->
      <div v-else class="px-4 py-12 text-center">
        <p class="unmodified-font-sans m-0 text-sm font-medium text-[#121212]">No agents found</p>
        <p class="unmodified-font-sans m-0 mt-1 text-[13px] text-[#6B6B6B]">
          Try a different search, or create a new agent to get started.
        </p>
      </div>
    </div>

    <p class="unmodified-font-sans m-0 mt-3 text-center text-xs text-[#8A8A8A]">
      Select an agent to view runs, accuracy trend, memory and deployment.
    </p>
  </div>
</template>
