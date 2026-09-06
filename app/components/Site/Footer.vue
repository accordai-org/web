<script setup lang="ts">
const columns = [
  {
    title: "Product",
    links: [
      { label: "Agent builder", to: "/use/agent" },
      { label: "Marketplace", to: "/use/marketplace" },
      { label: "My agents", to: "/use/my-agents" },
      { label: "Analytics", to: "/use/analytics" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", to: "#developers" },
      { label: "API reference", to: "#developers" },
      { label: "Integrations", to: "#platform" },
      { label: "Changelog", to: "#platform" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "#top" },
      { label: "Customers", to: "#customers" },
      { label: "Pricing", to: "#pricing" },
      { label: "Contact", to: "#cta" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "#top" },
      { label: "Terms", to: "#top" },
      { label: "Security", to: "#developers" },
      { label: "DPA", to: "#developers" },
    ],
  },
];
</script>

<template>
  <footer class="border-t border-[#E3E3E3] bg-white">
    <div class="mx-auto w-full max-w-[1120px] px-6 py-14">
      <div class="grid grid-cols-[1.2fr_repeat(4,1fr)] gap-8 max-md:grid-cols-2">
        <div>
          <div class="flex items-center gap-2">
            <span class="flex h-6 w-6 items-center justify-center rounded-[7px] bg-[#273BE2]">
              <span class="font-sans text-[13px] font-semibold leading-none text-white">A</span>
            </span>
            <span class="font-sans text-[15px] font-semibold text-[#121212]">Accord</span>
          </div>
          <p class="font-sans mt-3 max-w-[220px] text-[13px] leading-relaxed text-[#6B6B6B]">
            Agent infrastructure for teams that ship. Describe the work — Accord builds the agent.
          </p>
        </div>
        <nav v-for="col in columns" :key="col.title" :aria-label="col.title">
          <h3 class="font-sans m-0 mb-3 text-xs font-medium uppercase tracking-[0.08em] text-[#8A8A8A]">
            {{ col.title }}
          </h3>
          <ul class="m-0 flex flex-col gap-2 p-0" style="list-style: none;">
            <li v-for="l in col.links" :key="l.label">
              <NuxtLink
                v-if="l.to.startsWith('/')"
                :to="l.to"
                class="font-sans text-[13.5px] text-[#5F5F5F] no-underline transition-colors duration-100 hover:text-[#121212]"
              >
                {{ l.label }}
              </NuxtLink>
              <a
                v-else
                :href="l.to"
                class="font-sans text-[13.5px] text-[#5F5F5F] no-underline transition-colors duration-100 hover:text-[#121212]"
              >
                {{ l.label }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div class="mt-12 flex items-center justify-between border-t border-[#E3E3E3] pt-6 max-sm:flex-col max-sm:items-start max-sm:gap-2">
        <p class="font-sans m-0 text-xs text-[#8A8A8A]">Accord © 2026</p>
        <p class="font-sans m-0 text-xs text-[#8A8A8A]">Built for teams that run agents in production.</p>
      </div>
    </div>
  </footer>
</template>
