<script setup lang="ts">
import { ref } from "vue";
import { SmoothCorners } from "@lisse/vue";
import {
  Cloud,
  Store,
  Layers,
  Activity,
  ChevronDown,
  SquarePen,
  Settings,
} from "@lucide/vue";

const route = useRoute();

const navigation = [
  {
    name: "Agents",
    to: "/use/agent",
    icon: Cloud,
    tooltip: "Describe what you want and create a new agent.",
  },
  {
    name: "Marketplace",
    to: "/use/marketplace",
    icon: Store,
    tooltip: "Discover agents created by other users.",
  },
  {
    name: "My agents",
    to: "/use/my-agents",
    icon: Layers,
    tooltip: "See the agents you have created.",
  },
  {
    name: "Analytics",
    to: "/use/analytics",
    icon: Activity,
    tooltip: "See performance and usage across your agents.",
  },
];

const navbar = computed(() => {
  const path = route.path;
  if (path.startsWith("/use/my-agents")) {
    return {
      label: "My agents",
      action: {
        label: "New agent",
        to: "/use/agent",
        icon: Cloud,
      },
    };
  }
  if (path === "/use/agent") {
    return {
      label: "Agents",
      action: {
        label: "New agent",
        to: "/use/agent",
        icon: Cloud,
      },
    };
  }
  if (path === "/use/marketplace") {
    return {
      label: "Marketplace",
    };
  }
  if (path === "/use/analytics") {
    return {
      label: "Analytics",
    };
  }
  if (path === "/use/settings") {
    return {
      label: "Settings",
    };
  }
  return {
    label: "Accord",
  };
});
</script>

<template>
  <main
    class="unmodified-font-sans flex h-screen w-full justify-start border border-black bg-[#F4F4F4] p-2.5"
  >
    <aside class="flex w-55 shrink-0 flex-col py-2.5 pr-2.5 max-md:hidden">
      <!-- USER / TOP ACTIONS -->
      <div class="mb-5 flex items-center justify-between">
        <SmoothCorners
          as-child
          :corners="{ radius: 10 }"
        >
          <button
            type="button"
            class="flex items-center gap-x-1.25 rounded-[10px] px-1 py-1 transition-colors duration-100 hover:bg-[#EBEBEB]"
          >
            <SmoothCorners
              as-child
              :corners="{ radius: 7 }"
            >
              <div
                class="flex h-6 w-6 items-center justify-center bg-[#273BE2] p-0.5"
              >
                <span class="font-sans text-sm text-white">
                  A
                </span>
              </div>
            </SmoothCorners>
            <div class="flex items-center gap-x-0.75">
              <span
                class="font-sans text-sm font-medium text-[#121212]"
              >
                Username
              </span>
              <ChevronDown
                :size="15"
                color="#6B6B6B"
                :stroke-width="1.5"
              />
            </div>
          </button>
        </SmoothCorners>
        <!-- NEW AGENT -->
        <div class="relative group">
          <SmoothCorners
            as-child
            :corners="{ radius: 999 }"
            :middle-border="{
              width: 1,
              color: '#EBEBEB',
              opacity: 1
            }"
          >
            <button
              type="button"
              title="New agent"
              class="flex h-7 w-7 items-center justify-center rounded-full bg-white transition-all duration-150 hover:bg-[#EBEBEB]"
              @click="$router.push('/use/agent')"
            >
              <SquarePen
                :size="14"
                :stroke-width="1.7"
                class="text-[#6B6B6B] transition-colors duration-100 group-hover:text-[#121212]"
              />
            </button>
          </SmoothCorners>
          <UIAppsNavTooltip text="Create a new agent." />
        </div>
      </div>

      <!-- NAVIGATION -->
      <nav class="flex flex-col gap-y-0.5">
        <div
          v-for="item in navigation"
          :key="item.to"
          class="relative group"
        >
          <SmoothCorners
            as-child
            :corners="{ radius: 10, smoothing: 0.6 }"
          >
            <NuxtLink
              :to="item.to"
              :class="[
                'flex items-center gap-x-1.5 px-1.5 py-1 transition-colors duration-100',
                route.path === item.to || (item.to !== '/use/agent' && route.path.startsWith(item.to))
                  ? 'bg-[#E3E3E3]'
                  : 'hover:bg-[#EBEBEB]'
              ]"
            >
              <component
                :is="item.icon"
                :size="14"
                :stroke-width="1.8"
                :class="[
                  'transition-colors duration-100',
                  route.path === item.to || (item.to !== '/use/agent' && route.path.startsWith(item.to))
                    ? 'text-[#121212]'
                    : 'text-[#6B6B6B] group-hover:text-[#121212]'
                ]"
              />
              <span
                :class="[
                  'unmodified-font-sans text-sm font-normal transition-colors duration-100',
                  route.path === item.to || (item.to !== '/use/agent' && route.path.startsWith(item.to))
                    ? 'text-[#121212]'
                    : 'text-[#6B6B6B] group-hover:text-[#121212]'
                ]"
              >
                {{ item.name }}
              </span>
            </NuxtLink>
          </SmoothCorners>
          <UIAppsNavTooltip :text="item.tooltip" />
        </div>
      </nav>

      <!-- SETTINGS -->
      <div class="mt-auto">
        <div class="relative group">
          <SmoothCorners
            as-child
            :corners="{ radius: 10, smoothing: 0.6 }"
          >
            <NuxtLink
              to="/use/settings"
              :class="[
                'flex items-center gap-x-1.5 px-1.5 py-1 transition-colors duration-100',
                route.path === '/use/settings'
                  ? 'bg-[#E3E3E3]'
                  : 'hover:bg-[#EBEBEB]'
              ]"
            >
              <Settings
                :size="14"
                :stroke-width="1.8"
                :class="[
                  'transition-colors duration-100',
                  route.path === '/use/settings'
                    ? 'text-[#121212]'
                    : 'text-[#6B6B6B] group-hover:text-[#121212]'
                ]"
              />
              <span
                :class="[
                  'unmodified-font-sans text-sm transition-colors duration-100',
                  route.path === '/use/settings'
                    ? 'text-[#121212]'
                    : 'text-[#6B6B6B] group-hover:text-[#121212]'
                ]"
              >
                Settings
              </span>
            </NuxtLink>
          </SmoothCorners>
          <UIAppsNavTooltip text="Manage your Accord preferences." />
        </div>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <section
      class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-[#E3E3E3] bg-[#FAFAFA]"
    >
      <!-- MAIN NAVBAR -->
      <nav
        class="flex h-11 w-full shrink-0 items-center justify-between border-b border-[#E3E3E3] px-3"
      >
        <!-- LEFT SIDE -->
        <div class="flex min-w-0 items-center">
          <span
            class="unmodified-font-sans px-1.5 text-sm font-medium text-[#121212]"
          >
            {{ navbar.label }}
          </span>
        </div>

        <!-- RIGHT SIDE -->
        <div
          v-if="navbar.action"
          class="flex shrink-0 items-center"
        >
          <SmoothCorners
            as-child
            :corners="{ radius: 9, smoothing: 0.6 }"
          >
            <NuxtLink
              :to="navbar.action.to"
              class="group flex items-center gap-x-1.5 px-2 py-1 transition-colors duration-100 hover:bg-[#EBEBEB]"
            >
              <component
                :is="navbar.action.icon"
                :size="14"
                :stroke-width="1.7"
                class="text-[#6B6B6B] transition-colors duration-100 group-hover:text-[#121212]"
              />
              <span
                class="unmodified-font-sans text-sm font-medium text-[#5F5F5F] transition-colors duration-100 group-hover:text-[#121212]"
              >
                {{ navbar.action.label }}
              </span>
            </NuxtLink>
          </SmoothCorners>
        </div>
      </nav>

      <section class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <slot />
      </section>
    </section>
  </main>
</template>
