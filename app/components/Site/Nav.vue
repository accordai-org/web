<script setup lang="ts">
import { ref } from "vue";
import { Menu, X, ArrowRight } from "@lucide/vue";
import { SmoothCorners } from "@lisse/vue";

const open = ref(false);

const links = [
  { label: "Platform", to: "#platform" },
  { label: "Use cases", to: "#use-cases" },
  { label: "Developers", to: "#developers" },
  { label: "Pricing", to: "#pricing" },
];
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-[#E3E3E3] bg-white/90 backdrop-blur">
    <div class="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between px-6">
      <!-- Wordmark -->
      <NuxtLink to="/" class="flex items-center gap-2 no-underline" aria-label="Accord home">
        <SmoothCorners as-child :corners="{ radius: 7, smoothing: 0.6 }">
          <span class="flex h-6 w-6 items-center justify-center rounded-[7px] bg-[#273BE2]">
            <span class="font-sans text-[13px] font-semibold leading-none text-white">A</span>
          </span>
        </SmoothCorners>
        <span class="font-sans text-[15px] font-semibold tracking-[-0.01em] text-[#121212]">Accord</span>
      </NuxtLink>

      <!-- Desktop links -->
      <nav class="flex items-center gap-1 max-md:hidden" aria-label="Primary">
        <a
          v-for="l in links"
          :key="l.label"
          :href="l.to"
          class="font-sans rounded-md px-2.5 py-1.5 text-[13.5px] text-[#5F5F5F] no-underline transition-colors duration-100 hover:bg-[#F4F4F4] hover:text-[#121212]"
        >
          {{ l.label }}
        </a>
      </nav>

      <!-- Desktop actions -->
      <div class="flex items-center gap-2 max-md:hidden">
        <SmoothCorners as-child :corners="{ radius: 12, smoothing: 0.6 }">
          <a
            href="#pricing"
            class="font-sans rounded-[12px] px-3 py-[7px] text-[13px] font-medium text-[#5F5F5F] no-underline transition-colors duration-100 hover:bg-[#F4F4F4] hover:text-[#121212]"
          >
            Contact sales
          </a>
        </SmoothCorners>
        <SmoothCorners as-child :corners="{ radius: 12, smoothing: 0.6 }">
          <NuxtLink
            to="/use/agent"
            class="font-sans group flex items-center gap-1.5 rounded-[12px] bg-[#121212] px-4 py-[7px] text-[13px] font-medium text-white no-underline transition-colors duration-100 hover:bg-[#3F3F3F]"
          >
            Start building
            <ArrowRight :size="14" :stroke-width="2" class="transition-transform duration-150 group-hover:translate-x-[2px]" />
          </NuxtLink>
        </SmoothCorners>
      </div>

      <!-- Mobile toggle -->
      <button
        type="button"
        class="hidden items-center justify-center rounded-[8px] p-2 text-[#121212] hover:bg-[#F4F4F4] max-md:flex"
        :aria-expanded="open"
        aria-label="Toggle menu"
        @click="open = !open"
      >
        <component :is="open ? X : Menu" :size="18" :stroke-width="1.8" />
      </button>
    </div>

    <!-- Mobile menu -->
    <div v-if="open" class="border-t border-[#E3E3E3] bg-white px-6 py-3 md:hidden">
      <nav class="flex flex-col" aria-label="Mobile">
        <a
          v-for="l in links"
          :key="l.label"
          :href="l.to"
          class="font-sans border-b border-[#F4F4F4] py-2.5 text-sm text-[#121212] no-underline last:border-0"
          @click="open = false"
        >
          {{ l.label }}
        </a>
        <SmoothCorners as-child :corners="{ radius: 12, smoothing: 0.6 }">
          <NuxtLink
            to="/use/agent"
            class="font-sans mt-2 flex items-center justify-center gap-1.5 rounded-[12px] bg-[#121212] px-3.5 py-2 text-sm font-medium text-white no-underline"
          >
            Start building
            <ArrowRight :size="14" :stroke-width="2" />
          </NuxtLink>
        </SmoothCorners>
      </nav>
    </div>
  </header>
</template>
