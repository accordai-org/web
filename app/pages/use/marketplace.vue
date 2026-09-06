<script setup lang="ts">
import { SmoothCorners } from "@lisse/vue";
import {
  ArrowUpRight,
  Bot,
  Calendar,
  Code,
  Globe,
  Mail,
  MessageSquare,
  Music,
  PenLine,
  Search,
  Star,
  Zap,
  type LucideIcon,
} from "@lucide/vue";

definePageMeta({ layout: "use" });

interface MarketplaceAgent {
  name: string;
  type: string;
  description: string;
  users: string;
  author: string;
  initials: string;
  icon: LucideIcon;
  tile: string;
  iconColor: string;
}

const agents: MarketplaceAgent[] = [
  {
    name: "Support Copilot",
    type: "Support",
    description: "Answers tickets, drafts replies, and escalates what needs a human touch.",
    users: "12.4k",
    author: "Accord",
    initials: "AC",
    icon: MessageSquare,
    tile: "bg-[#E8ECFF]",
    iconColor: "text-[#273BE2]",
  },
  {
    name: "Code Reviewer",
    type: "Coding",
    description: "Reviews pull requests, flags bugs, and suggests cleaner patterns.",
    users: "9.8k",
    author: "DevLoop",
    initials: "DL",
    icon: Code,
    tile: "bg-[#E5F6EC]",
    iconColor: "text-[#1C7A43]",
  },
  {
    name: "Blog Writer",
    type: "Writing",
    description: "Turns rough notes into polished posts in your brand voice.",
    users: "8.1k",
    author: "Copyhouse",
    initials: "CH",
    icon: PenLine,
    tile: "bg-[#FDF1E3]",
    iconColor: "text-[#B25E09]",
  },
  {
    name: "Research Scout",
    type: "Research",
    description: "Scans the web and condenses findings into cited briefs.",
    users: "7.3k",
    author: "Fieldnotes",
    initials: "FN",
    icon: Search,
    tile: "bg-[#EDE9FE]",
    iconColor: "text-[#6D28D9]",
  },
  {
    name: "Inbox Zero",
    type: "Productivity",
    description: "Triages your inbox, drafts follow-ups, and books the meetings.",
    users: "6.9k",
    author: "Accord",
    initials: "AC",
    icon: Mail,
    tile: "bg-[#E0F2F7]",
    iconColor: "text-[#0E7490]",
  },
  {
    name: "Site Crawler",
    type: "Data",
    description: "Extracts structured data from any site on a recurring schedule.",
    users: "5.4k",
    author: "Parsewell",
    initials: "PW",
    icon: Globe,
    tile: "bg-[#F3E8FF]",
    iconColor: "text-[#A21CAF]",
  },
  {
    name: "Standup Bot",
    type: "Team",
    description: "Collects async standups and posts a digest every morning.",
    users: "4.7k",
    author: "DevLoop",
    initials: "DL",
    icon: Calendar,
    tile: "bg-[#FFE9E9]",
    iconColor: "text-[#C2410C]",
  },
  {
    name: "Playlist DJ",
    type: "Fun",
    description: "Builds playlists from a mood, a genre, or a single track.",
    users: "3.2k",
    author: "Waveform",
    initials: "WF",
    icon: Music,
    tile: "bg-[#E7F9EF]",
    iconColor: "text-[#047857]",
  },
  {
    name: "Quick Automate",
    type: "Automation",
    description: "Watches your apps and fires multi-step workflows in seconds.",
    users: "2.9k",
    author: "Relay",
    initials: "RL",
    icon: Zap,
    tile: "bg-[#FFF7D6]",
    iconColor: "text-[#A16207]",
  },
];
</script>

<template>
  <div class="font-sans unmodified-font-sans mx-auto w-full max-w-5xl px-6 py-10">
    <!-- HERO -->
    <div class="mb-8 text-center">
      <h1 class="unmodified-font-sans m-0 mb-1 text-xl font-medium tracking-[-0.01em] text-[#121212]">Marketplace</h1>
      <p class="unmodified-font-sans m-0 text-sm text-[#6B6B6B]">Discover pre-built agents from the community.</p>
    </div>

    <!-- CARD GRID -->
    <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
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
