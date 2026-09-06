<script setup lang="ts">
definePageMeta({ layout: 'use' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const agent = computed(() => {
  const map: Record<string, { name: string; desc: string; status: string; runs: string }> = {
    'inbox-triage': { name: 'Inbox triage', desc: 'Drafts replies to partnership requests from your inbox.', status: 'Active', runs: '1,204' },
    'pr-reviewer': { name: 'PR reviewer', desc: 'Reviews every PR against your style guide.', status: 'Active', runs: '862' },
    'competitor-watch': { name: 'Competitor watch', desc: 'Tracks competitor launches and summarises changes.', status: 'Paused', runs: '319' },
  }
  return map[id.value] ?? { name: id.value, desc: 'Owned/deployed agent asset.', status: 'Active', runs: '0' }
})

const stats = [
  { label: 'Runs', value: agent.value.runs },
  { label: 'Success rate', value: '97.2%' },
  { label: 'Token usage', value: '1.2M' },
  { label: 'Cost', value: '$18.40' },
  { label: 'Earnings', value: '$0.00' },
]
</script>

<template>
  <div class="font-sans unmodified-font-sans p-6">
    <NuxtLink to="/use/my-agents" class="unmodified-font-sans text-xs text-[#6B6B6B] no-underline hover:text-[#121212]">← My agents</NuxtLink>
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
        <ul class="unmodified-font-sans m-0 flex flex-col gap-1.5 pl-4 text-xs text-[#5F5F5F]">
          <li>Prefers concise replies for partnership emails</li>
          <li>Escalates pricing questions to a human</li>
        </ul>
      </section>
      <section class="rounded-[10px] border border-[#E3E3E3] bg-white p-3.5">
        <h2 class="unmodified-font-sans m-0 mb-2.5 text-[13px] font-medium text-[#121212]">Tool usage &amp; performance</h2>
        <ul class="unmodified-font-sans m-0 flex flex-col gap-1.5 pl-4 text-xs text-[#5F5F5F]">
          <li>Gmail — 812 calls · 99% success</li>
          <li>Knowledge base — 640 calls · 96% success</li>
        </ul>
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
  </div>
</template>
