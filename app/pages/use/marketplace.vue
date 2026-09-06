<script setup lang="ts">
import { SmoothCorners } from "@lisse/vue";
import { ArrowUpRight, Bot, Star } from "@lucide/vue";
import { useMarketplace } from "~/composables/useMarketplace";

definePageMeta({ layout: "use" });

// Live list: page -> useMarketplace -> /api/marketplace/agents -> FastAPI.

const { agents, pending, error, refresh } = useMarketplace();
</script>

<template>
  <div class="font-sans unmodified-font-sans mx-auto w-full max-w-5xl px-6 py-10">
    <!-- HERO -->
    <div class="mb-8 text-center">
      <h1 class="unmodified-font-sans m-0 mb-1 text-xl font-medium tracking-[-0.01em] text-[#121212]">Marketplace</h1>
      <p class="unmodified-font-sans m-0 text-sm text-[#6B6B6B]">Discover pre-built agents from the community.</p>
    </div>

    <!-- LOADING -->
    <div
      v-if="pending"
      class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3"
      aria-label="Loading marketplace agents"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="flex flex-col rounded-[16px] border border-[#E8E8E8] bg-white p-5"
      >
        <div class="mb-3 h-10 w-10 rounded-[12px] bg-[#F1F1F1]" />
        <div class="h-4 w-2/3 rounded bg-[#F1F1F1]" />
        <div class="mt-2 h-3 w-full rounded bg-[#F4F4F4]" />
        <div class="mt-1.5 h-3 w-5/6 rounded bg-[#F4F4F4]" />
      </div>
    </div>

    <!-- CARD GRID -->
    <div
      v-else-if="agents.length > 0"
      class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3"
    >
      <SmoothCorners
        v-for="agent in agents"
        :key="agent.name"
        as-child
        :corners="{ radius: 16, smoothing: 0.6 }"
      >
        <article
          class="group flex flex-col border border-[#E8E8E8] bg-white p-5 transition-colors duration-150 hover:border-[rgba(39,59,226,0.25)] hover:bg-[rgba(39,59,226,0.05)]"
        >
          <!-- LOGO + TYPE -->
          <div class="mb-3 flex items-start justify-between">
            <SmoothCorners
              as-child
              :corners="{ radius: 12, smoothing: 0.6 }"
            >
              <div :class="['flex h-10 w-10 items-center justify-center', agent.tile]">
                <component
                  :is="agent.icon"
                  :size="19"
                  :stroke-width="1.9"
                  :class="agent.iconColor"
                />
              </div>
            </SmoothCorners>
            <span class="unmodified-font-sans rounded-full bg-[#F1F1F1] px-2 py-0.5 text-[11px] font-medium text-[#6B6B6B] transition-colors duration-150 group-hover:bg-[rgba(39,59,226,0.1)] group-hover:text-[#273BE2]">
              {{ agent.type }}
            </span>
          </div>

          <!-- TITLE + DESCRIPTION -->
          <h2 class="unmodified-font-sans m-0 text-[14.5px] font-medium text-[#121212]">{{ agent.name }}</h2>
          <p class="unmodified-font-sans mt-1 line-clamp-2 min-h-8 text-[13px] leading-snug text-[#6B6B6B]">
            {{ agent.description }}
          </p>

          <!-- STATS -->
          <div class="mt-3 flex items-center gap-x-3">
            <span class="flex items-center gap-x-1">
              <Star
                :size="13"
                :stroke-width="1.8"
                class="text-[#121212]"
              />
              <span class="unmodified-font-sans text-xs font-medium text-[#121212]">{{ agent.users }}</span>
              <span class="unmodified-font-sans text-xs text-[#9A9A9A]">users</span>
            </span>
          </div>

          <!-- DIVIDER -->
          <div class="my-3 h-px w-full bg-[#EFEFEF] transition-colors duration-150 group-hover:bg-[rgba(39,59,226,0.14)]" />

          <!-- AUTHOR + OPEN -->
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-x-1.5">
              <span class="unmodified-font-sans flex h-5.5 w-5.5 items-center justify-center rounded-full bg-[#EBEBEB] text-[9px] font-semibold text-[#5F5F5F]">
                {{ agent.initials }}
              </span>
              <span class="unmodified-font-sans text-xs text-[#6B6B6B]">{{ agent.author }}</span>
            </span>
            <button
              type="button"
              class="unmodified-font-sans flex items-center gap-x-0.5 rounded-md px-1.5 py-1 text-xs font-medium text-[#273BE2] transition-colors duration-150 hover:bg-[rgba(39,59,226,0.1)]"
            >
              Open agent
              <ArrowUpRight
                :size="13"
                :stroke-width="2"
              />
            </button>
          </div>
        </article>
      </SmoothCorners>
    </div>

    <!-- EMPTY -->
    <div v-else class="mx-auto flex w-full max-w-md flex-col items-center px-6 py-14 text-center">
      <Bot
        :size="22"
        :stroke-width="1.6"
        class="text-[#8A8A8A]"
      />
      <p class="unmodified-font-sans m-0 mt-3 text-[15px] font-medium text-[#121212]">No agents in the marketplace yet</p>
      <p class="unmodified-font-sans m-0 mt-1 text-sm text-[#6B6B6B]">Check back soon — community agents will appear here.</p>
      <p v-if="error" class="unmodified-font-sans m-0 mt-3 text-sm text-[#B42318]">
        {{ error }}
        <button
          type="button"
          class="ml-1 cursor-pointer font-medium underline"
          @click="refresh()"
        >
          Try again
        </button>
      </p>
    </div>

    <!-- FOOTNOTE -->
    <p class="unmodified-font-sans mt-8 flex items-center justify-center gap-x-1.5 text-center text-xs text-[#9A9A9A]">
      <Bot
        :size="13"
        :stroke-width="1.8"
      />
      Built something useful? Publish your agent to the marketplace.
    </p>
  </div>
</template>
