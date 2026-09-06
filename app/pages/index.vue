<script setup lang="ts">
import { ref } from "vue";
import {
  ArrowRight,
  Cloud,
  Layers,
  Activity,
  Store,
  Wrench,
  Brain,
  Database,
  Plug,
  ShieldCheck,
  ChartColumn,
  Inbox,
  Search,
  Code2,
  ClipboardList,
  Check,
  Server,
  Lock,
  FileText,
  Github,
} from "@lucide/vue";

useSeoMeta({
  title: "Accord — Describe the work. Accord builds the agent.",
  description:
    "Accord is agent infrastructure for teams that ship. Describe what you want in plain text — Accord builds the workflow, tools, and memory, then runs it in production.",
});

/* ---------- hero builder mock ---------- */
const demoPrompt = ref("");
const demoSuggestions = [
  { title: "Customer support agent", desc: "Answer tickets from Intercom in your tone" },
  { title: "Research assistant", desc: "Summarise papers and track competitors" },
  { title: "Code reviewer", desc: "Review every PR against your style guide" },
  { title: "Meeting notes agent", desc: "Turn calls into tasks and follow-ups" },
];
const demoChips = ["Tools", "Skills", "Knowledge", "Integrations"];

/* ---------- hero typewriter ---------- */
const heroFocused = ref(false);
const heroSamples = [
  "Monitor my inbox and draft replies to partnership requests…",
  "Review every PR against our style guide…",
  "Track competitor launches and brief me daily…",
  "Turn my meetings into tasks and follow-ups…",
];
const typedText = ref("");
let typeTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let sample = 0;
  let char = 0;
  let hold = 0;
  let deleting = false;
  typeTimer = setInterval(() => {
    if (heroFocused.value || demoPrompt.value) return;
    const full = heroSamples[sample];
    if (!deleting) {
      typedText.value = full.slice(0, ++char);
      if (char >= full.length) {
        deleting = true;
        hold = 28;
      }
    } else if (hold > 0) {
      hold--;
    } else {
      typedText.value = full.slice(0, --char);
      if (char <= 0) {
        deleting = false;
        sample = (sample + 1) % heroSamples.length;
      }
    }
  }, 38);
});

onUnmounted(() => {
  if (typeTimer) clearInterval(typeTimer);
  showcaseMm?.revert();
});

/* ---------- platform showcase ---------- */
const features = [
  {
    icon: Cloud,
    index: "01",
    title: "Build",
    tagline: "From sentence to agent.",
    desc: "Describe the outcome in plain text. Accord assembles the workflow, tools, skills, and memory — no pipeline code.",
    points: ["Workflows assembled for you", "Tools, skills and memory attached", "Guardrails set before first run"],
    to: "/use/agent",
    cta: "Build an agent",
  },
  {
    icon: Layers,
    index: "02",
    title: "Deploy",
    tagline: "From template to production.",
    desc: "Start from a community template or ship your own. One click puts an agent to work on your tools and data.",
    points: ["One-click template installs", "Your tools, scoped permissions", "Live in minutes, not sprints"],
    to: "/use/marketplace",
    cta: "Browse templates",
  },
  {
    icon: Activity,
    index: "03",
    title: "Observe",
    tagline: "Every run, measured.",
    desc: "Every run is logged, measured, and improvable. Watch success rate, latency, and cost per agent, per team.",
    points: ["Runs, latency and cost per agent", "Memories agents learn from", "Refine from accepted work"],
    to: "/use/analytics",
    cta: "See analytics",
  },
];
const activeFeature = ref(0);
const showcaseRef = ref<HTMLElement | null>(null);
let showcaseMm: { revert: () => void } | null = null;

onMounted(() => {
  const root = showcaseRef.value;
  if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const gsap = useGSAP();
  const mm = gsap.matchMedia();
  showcaseMm = mm;
  mm.add("(min-width: 768px)", () => {
    const cards = gsap.utils.toArray<HTMLElement>(".showcase-card");
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: "+=" + (cards.length - 1) * 100 + "%",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          activeFeature.value = Math.min(features.length - 1, Math.floor(self.progress * features.length));
        },
      },
    });
    cards.forEach((card, i) => {
      if (i === 0) return;
      tl.fromTo(card, { yPercent: 112 }, { yPercent: 0, ease: "none" }, (i - 1) * 0.6);
    });
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  });
});

/* ---------- capabilities ---------- */
const capabilities = [
  { icon: Wrench, title: "Tools", desc: "Connect Gmail, Slack, GitHub, and your internal APIs. Agents call them with scoped permissions." },
  { icon: Brain, title: "Skills", desc: "Reusable behaviours your agents learn once and apply everywhere — tone, escalation, review bars." },
  { icon: Database, title: "Knowledge", desc: "Point agents at docs, wikis, and past tickets. Answers stay grounded in your sources." },
  { icon: Plug, title: "Integrations", desc: "Native hooks into the stack you already run. No rip-and-replace, no middleware projects." },
  { icon: ShieldCheck, title: "Evals & guardrails", desc: "Set the rules up front: what an agent may touch, when it must ask, and how it proves its work." },
  { icon: ChartColumn, title: "Analytics", desc: "Runs, success rate, latency, and cost — per agent, per team, over time." },
];

/* ---------- use cases (tabs) ---------- */
const useCases = [
  {
    id: "support",
    label: "Support",
    icon: Inbox,
    headline: "Tickets triaged, drafted, and resolved in your tone.",
    desc: "Accord agents read every ticket, pull the right knowledge, and draft replies your team approves in one click.",
    points: ["Auto-triage by intent and urgency", "Drafts grounded in your help centre", "Escalates pricing and legal to humans"],
    stat: { value: "1,204", label: "runs on the inbox-triage template" },
  },
  {
    id: "research",
    label: "Research",
    icon: Search,
    headline: "Competitors, papers, and markets — summarised daily.",
    desc: "A research agent watches your sources and lands a briefing in Slack before standup, with links to everything.",
    points: ["Tracks launches, pricing, and hiring moves", "Summaries with source citations", "Scheduled or on-demand briefings"],
    stat: { value: "319", label: "runs on the competitor-watch template" },
  },
  {
    id: "engineering",
    label: "Engineering",
    icon: Code2,
    headline: "Every PR reviewed against your style guide.",
    desc: "The reviewer agent reads the diff, checks your conventions, and leaves comments engineers actually accept.",
    points: ["Custom rules per repository", "Noise filtered before it reaches humans", "Improves from accepted suggestions"],
    stat: { value: "862", label: "runs on the pr-reviewer template" },
  },
  {
    id: "operations",
    label: "Operations",
    icon: ClipboardList,
    headline: "Recurring ops work, executed on schedule.",
    desc: "Meeting notes to tasks, weekly digests, vendor follow-ups — the work between the work, handled.",
    points: ["Turns calls into tasks and owners", "Scheduled reports without prompting", "Flags risks before they slip"],
    stat: { value: "97.2%", label: "success rate across active agents" },
  },
];
const activeUseCase = ref(useCases[0].id);
const currentUseCase = computed(() => useCases.find((u) => u.id === activeUseCase.value) ?? useCases[0]);

/* ---------- marketplace teaser ---------- */
const templates = [
  { icon: Inbox, name: "Inbox triage", desc: "Drafts replies to partnership requests from your inbox.", meta: "Support · 1.2k runs" },
  { icon: Code2, name: "PR reviewer", desc: "Reviews every PR against your style guide.", meta: "Engineering · 862 runs" },
  { icon: Search, name: "Competitor watch", desc: "Tracks launches and summarises what changed.", meta: "Research · 319 runs" },
];

/* ---------- metrics (count-up on scroll) ---------- */
const metricDefs = [
  { value: 2385, label: "Total runs", format: (n: number) => Math.round(n).toLocaleString("en-US") },
  { value: 97.2, label: "Success rate", format: (n: number) => n.toFixed(1) + "%" },
  { value: 1.8, label: "Avg latency", format: (n: number) => n.toFixed(1) + "s" },
  { value: 3, label: "Active agents", format: (n: number) => String(Math.round(n)) },
];
const metricShown = ref(metricDefs.map((d) => d.format(0)));
const metricsRef = ref<HTMLElement | null>(null);

onMounted(() => {
  const el = metricsRef.value;
  if (!el) return;
  const done = () => {
    metricShown.value = metricDefs.map((d) => d.format(d.value));
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          done();
          return;
        }
        const start = performance.now();
        const dur = 1300;
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          metricShown.value = metricDefs.map((d) => d.format(d.value * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.3 }
  );
  io.observe(el);
});

/* ---------- deploy options ---------- */
const deployOptions = [
  { icon: Cloud, title: "Accord Cloud", desc: "Start in minutes on managed infrastructure. Build, deploy, and scale from one console." },
  { icon: Server, title: "Your VPC", desc: "Run agents inside your own cloud boundary. Your data never leaves your walls." },
  { icon: Lock, title: "Self-hosted", desc: "Full control for regulated environments — advanced customisation, your keys, your audit trail." },
];

/* ---------- pricing ---------- */
const tiers = [
  {
    name: "Starter",
    price: "$0",
    per: "to start",
    desc: "For trying your first agents.",
    features: ["3 active agents", "Community templates", "Basic analytics", "Community support"],
    cta: "Start building",
    to: "/use/agent",
    featured: false,
  },
  {
    name: "Team",
    price: "$20",
    per: "per seat / month",
    desc: "For teams running agents in production.",
    features: ["Unlimited agents", "Skills & shared knowledge", "Evals & guardrails", "Priority support"],
    cta: "Start building",
    to: "/use/agent",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    per: "annual",
    desc: "For regulated, large-scale deployments.",
    features: ["VPC or self-hosted", "SSO & audit logs", "Dedicated support", "Custom limits"],
    cta: "Contact sales",
    to: "#cta",
    featured: false,
  },
];
</script>

<template>
  <div id="top" class="min-h-screen bg-white text-[#121212]">
    <SiteNav />

    <main>
      <!-- ============ HERO ============ -->
      <section class="mx-auto w-full max-w-[1120px] px-6 pb-16 pt-16 text-center md:pt-24">
        <h1 class="hero-enter font-sans m-0 mx-auto max-w-[760px] text-[42px] font-semibold leading-[1.04] text-[#121212] md:text-[64px]" style="animation-delay: 0ms;">
          Describe the work.<br />Accord builds the agent.
        </h1>
        <p class="hero-enter font-sans mx-auto mt-6 max-w-[560px] text-pretty text-[16px] leading-relaxed text-[#5F5F5F] md:text-[18px]" style="animation-delay: 90ms;">
          Accord is agent infrastructure for teams that ship. Write what you want in plain
          text — Accord assembles the workflow, tools, and memory, then runs it in production.
        </p>
        <div class="hero-enter mt-8 flex items-center justify-center gap-3 max-sm:flex-col max-sm:items-stretch" style="animation-delay: 180ms;">
          <NuxtLink
            to="/use/agent"
            class="font-sans group inline-flex items-center justify-center gap-1.5 rounded-[16px] bg-[#121212] px-6 py-3 text-sm font-medium text-white no-underline transition-colors duration-100 hover:bg-[#3F3F3F]"
          >
            Start building
            <ArrowRight :size="15" :stroke-width="2" class="transition-transform duration-150 group-hover:translate-x-[2px]" />
          </NuxtLink>
          <a
            href="#platform"
            class="font-sans inline-flex items-center justify-center rounded-[16px] border border-[#E3E3E3] bg-white px-6 py-3 text-sm font-medium text-[#121212] no-underline transition-colors duration-100 hover:bg-[#F4F4F4]"
          >
            See the platform
          </a>
        </div>

        <!-- Builder mock -->
        <div class="hero-enter mx-auto mt-14 max-w-[680px] text-left" style="animation-delay: 270ms;">
          <div class="rounded-[20px] border border-[#E3E3E3] bg-white p-2 shadow-[0_16px_50px_rgba(0,0,0,0.08)]">
            <div class="flex items-center gap-1.5 border-b border-[#F4F4F4] px-3 py-2.5" aria-hidden="true">
              <span class="h-2.5 w-2.5 rounded-full bg-[#E3E3E3]" />
              <span class="h-2.5 w-2.5 rounded-full bg-[#E3E3E3]" />
              <span class="h-2.5 w-2.5 rounded-full bg-[#E3E3E3]" />
              <span class="font-sans ml-2 text-xs text-[#8A8A8A]">accord — new agent</span>
            </div>
            <div class="p-2">
              <label for="hero-demo-prompt" class="font-sans mb-1.5 block px-1 text-xs font-medium text-[#8A8A8A]">
                What should your agent do?
              </label>
              <textarea
                id="hero-demo-prompt"
                v-model="demoPrompt"
                rows="3"
                :placeholder="typedText || heroSamples[0]"
                class="font-sans box-border w-full resize-none rounded-[12px] border-0 bg-[#FAFAFA] px-3 py-2.5 text-sm leading-relaxed text-[#121212] outline-0 placeholder:text-[#8A8A8A] focus:bg-[#F4F4F4]"
                @focus="heroFocused = true"
                @blur="heroFocused = false"
              />
              <div class="flex items-center justify-between gap-2 p-1.5 max-sm:flex-col max-sm:items-stretch">
                <div class="flex flex-wrap gap-1.5" aria-label="Agent building blocks">
                  <span
                    v-for="chip in demoChips"
                    :key="chip"
                    class="font-sans rounded-[10px] border border-[#E3E3E3] px-2.5 py-[5px] text-xs text-[#5F5F5F]"
                  >
                    + {{ chip }}
                  </span>
                </div>
                <NuxtLink
                  to="/use/agent"
                  class="font-sans inline-flex shrink-0 items-center justify-center gap-1 rounded-[12px] bg-[#121212] px-4 py-2 text-xs font-medium text-white no-underline transition-colors duration-100 hover:bg-[#273BE2]"
                >
                  Build agent <span aria-hidden="true">→</span>
                </NuxtLink>
              </div>
            </div>
          </div>
          <div class="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            <button
              v-for="s in demoSuggestions"
              :key="s.title"
              type="button"
              class="flex cursor-pointer flex-col gap-1 rounded-[14px] border border-[#E3E3E3] bg-white p-3 text-left transition-colors duration-100 hover:border-[#121212]"
              @click="demoPrompt = s.desc"
            >
              <span class="font-sans text-[13px] font-medium text-[#121212]">{{ s.title }}</span>
              <span class="font-sans text-xs leading-relaxed text-[#6B6B6B]">{{ s.desc }}</span>
            </button>
          </div>
          <p class="font-sans mt-3 text-center text-xs text-[#8A8A8A]">
            Interactive preview — <NuxtLink to="/use/agent" class="text-[#273BE2] no-underline hover:underline">open the real builder</NuxtLink>
          </p>
        </div>
      </section>

      <!-- ============ PLATFORM SHOWCASE ============ -->
      <section id="platform" class="scroll-mt-20 border-b border-[#E3E3E3] bg-white">
        <div ref="showcaseRef" class="mx-auto grid w-full max-w-[1120px] grid-cols-2 items-center gap-12 px-6 py-16 max-md:grid-cols-1 md:min-h-screen md:py-0">
          <!-- Left: text that changes as cards slide over (desktop) -->
          <div class="max-md:hidden">
            <p class="font-sans m-0 mb-4 text-xs font-medium uppercase tracking-[0.08em] text-[#8A8A8A]">Platform</p>
            <div :key="activeFeature" class="tab-panel-enter">
              <p class="font-sans m-0 text-sm font-semibold text-[#273BE2]">{{ features[activeFeature].index }} / 03</p>
              <h2 class="font-sans m-0 mt-2 text-[44px] font-semibold leading-[1.05] text-[#121212]">
                {{ features[activeFeature].title }}
              </h2>
              <p class="font-sans m-0 mt-3 text-[18px] font-medium text-[#121212]">
                {{ features[activeFeature].tagline }}
              </p>
              <p class="font-sans m-0 mt-3 max-w-[400px] text-[15px] leading-relaxed text-[#5F5F5F]">
                {{ features[activeFeature].desc }}
              </p>
              <NuxtLink :to="features[activeFeature].to" class="font-sans group mt-6 inline-flex items-center gap-1.5 rounded-[14px] bg-[#121212] px-5 py-2.5 text-sm font-medium text-white no-underline transition-colors duration-100 hover:bg-[#273BE2]">
                {{ features[activeFeature].cta }}
                <ArrowRight :size="14" :stroke-width="2" class="transition-transform duration-150 group-hover:translate-x-[2px]" />
              </NuxtLink>
            </div>
            <div class="mt-10 flex gap-2" aria-hidden="true">
              <span
                v-for="(f, i) in features"
                :key="f.title"
                class="h-1 rounded-full transition-all duration-300"
                :class="i === activeFeature ? 'w-10 bg-[#121212]' : 'w-4 bg-[#E3E3E3]'"
              />
            </div>
          </div>

          <!-- Mobile header -->
          <div class="md:hidden">
            <p class="font-sans m-0 mb-3 text-xs font-medium uppercase tracking-[0.08em] text-[#8A8A8A]">Platform</p>
            <h2 class="font-sans m-0 max-w-[640px] text-[32px] font-semibold leading-[1.08] text-[#121212]">
              Everything an agent needs, in one place.
            </h2>
          </div>

          <!-- Right: cards that slide up and cover each other -->
          <div class="relative flex flex-col gap-4 md:block md:h-[560px] md:overflow-hidden">
            <article
              v-for="(f, i) in features"
              :key="f.title"
              class="showcase-card flex flex-col rounded-[20px] border border-[#E3E3E3] bg-white p-8 shadow-[0_16px_50px_rgba(0,0,0,0.08)] md:absolute md:inset-0 md:p-10"
            >
              <div class="flex items-start justify-between">
                <span class="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#121212] text-white">
                  <component :is="f.icon" :size="22" :stroke-width="1.7" />
                </span>
                <span class="font-sans text-sm font-semibold text-[#8A8A8A]">{{ f.index }}</span>
              </div>
              <h3 class="font-sans m-0 mt-6 text-[26px] font-semibold leading-[1.1] text-[#121212]">{{ f.title }}</h3>
              <p class="font-sans m-0 mt-2 text-[15px] font-medium text-[#273BE2]">{{ f.tagline }}</p>
              <p class="font-sans m-0 mt-3 text-sm leading-relaxed text-[#5F5F5F]">{{ f.desc }}</p>
              <ul class="font-sans m-0 mt-6 flex flex-col gap-2.5 p-0" style="list-style: none;">
                <li v-for="pt in f.points" :key="pt" class="flex items-start gap-2 text-sm text-[#121212]">
                  <Check :size="15" :stroke-width="2" class="mt-[3px] shrink-0 text-[#16A34A]" />
                  {{ pt }}
                </li>
              </ul>
              <div class="mt-auto pt-8">
                <NuxtLink :to="f.to" class="font-sans group inline-flex items-center gap-1.5 rounded-[14px] border border-[#E3E3E3] px-5 py-2.5 text-sm font-medium text-[#121212] no-underline transition-colors duration-100 hover:border-[#121212]">
                  {{ f.cta }}
                  <ArrowRight :size="14" :stroke-width="2" class="transition-transform duration-150 group-hover:translate-x-[2px]" />
                </NuxtLink>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- ============ CAPABILITIES ============ -->
      <section class="mx-auto w-full max-w-[1120px] px-6 py-20 md:py-28">
        <p v-reveal class="font-sans m-0 mb-3 text-xs font-medium uppercase tracking-[0.08em] text-[#8A8A8A]">Capabilities</p>
        <h2 v-reveal="80" class="font-sans m-0 max-w-[640px] text-[32px] font-semibold leading-[1.08] text-[#121212] md:text-[44px]">
          Serious building blocks, not demos.
        </h2>
        <p v-reveal="140" class="font-sans mt-4 max-w-[560px] text-[15px] leading-relaxed text-[#5F5F5F]">
          Everything an agent touches — tools, memory, rules, and proof — managed in one place.
        </p>
        <div class="mt-12 grid grid-cols-3 gap-4 max-md:grid-cols-1">
          <div v-for="(c, i) in capabilities" :key="c.title" v-reveal="(i % 3) * 90" class="group rounded-[20px] border border-[#E3E3E3] bg-white p-8 transition-all duration-200 hover:-translate-y-1 hover:border-[#121212] hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)]">
            <span class="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#F4F4F4] text-[#121212] transition-colors duration-200 group-hover:bg-[#273BE2] group-hover:text-white">
              <component :is="c.icon" :size="22" :stroke-width="1.7" />
            </span>
            <h3 class="font-sans m-0 mb-2 mt-5 text-[17px] font-semibold text-[#121212]">{{ c.title }}</h3>
            <p class="font-sans m-0 text-sm leading-relaxed text-[#5F5F5F]">{{ c.desc }}</p>
          </div>
        </div>
      </section>

      <!-- ============ USE CASES ============ -->
      <section id="use-cases" class="border-y border-[#E3E3E3] bg-[#FAFAFA]">
        <div class="mx-auto w-full max-w-[1120px] scroll-mt-20 px-6 py-20 md:py-28">
          <p v-reveal class="font-sans m-0 mb-3 text-xs font-medium uppercase tracking-[0.08em] text-[#8A8A8A]">Use cases</p>
          <h2 v-reveal="80" class="font-sans m-0 max-w-[640px] text-[32px] font-semibold leading-[1.08] text-[#121212] md:text-[44px]">
            One platform, every team.
          </h2>
          <div v-reveal="160" class="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Use cases">
            <button
              v-for="u in useCases"
              :key="u.id"
              role="tab"
              :aria-selected="activeUseCase === u.id"
              type="button"
              class="font-sans inline-flex cursor-pointer items-center gap-1.5 rounded-[12px] border px-4 py-2 text-[13px] font-medium transition-colors duration-100"
              :class="activeUseCase === u.id ? 'border-[#121212] bg-[#121212] text-white' : 'border-[#E3E3E3] bg-white text-[#5F5F5F] hover:border-[#121212] hover:text-[#121212]'"
              @click="activeUseCase = u.id"
            >
              <component :is="u.icon" :size="14" :stroke-width="1.8" />
              {{ u.label }}
            </button>
          </div>
          <div :key="currentUseCase.id" class="tab-panel-enter mt-4 grid grid-cols-[1.4fr_1fr] gap-3 max-md:grid-cols-1">
            <div class="rounded-[20px] border border-[#E3E3E3] bg-white p-8">
              <h3 class="font-sans m-0 max-w-[440px] text-[24px] font-semibold leading-[1.15] text-[#121212] md:text-[28px]">
                {{ currentUseCase.headline }}
              </h3>
              <p class="font-sans mt-3 max-w-[480px] text-sm leading-relaxed text-[#5F5F5F]">{{ currentUseCase.desc }}</p>
              <ul class="font-sans m-0 mt-5 flex flex-col gap-2.5 p-0" style="list-style: none;">
                <li v-for="pt in currentUseCase.points" :key="pt" class="flex items-start gap-2 text-sm text-[#121212]">
                  <Check :size="15" :stroke-width="2" class="mt-[3px] shrink-0 text-[#16A34A]" />
                  {{ pt }}
                </li>
              </ul>
              <NuxtLink to="/use/agent" class="font-sans group mt-6 inline-flex items-center gap-1 text-[13px] font-medium text-[#273BE2] no-underline hover:underline">
                Build a {{ currentUseCase.label.toLowerCase() }} agent
                <ArrowRight :size="13" :stroke-width="2" class="transition-transform duration-150 group-hover:translate-x-[2px]" />
              </NuxtLink>
            </div>
            <div class="flex flex-col justify-between rounded-[20px] bg-[#121212] p-8 text-white">
              <component :is="currentUseCase.icon" :size="22" :stroke-width="1.5" class="text-white" />
              <div class="mt-10">
                <p class="font-sans m-0 text-[44px] font-semibold leading-none">{{ currentUseCase.stat.value }}</p>
                <p class="font-sans m-0 mt-2 text-[13px] leading-relaxed text-[#A3A3A3]">{{ currentUseCase.stat.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ MARKETPLACE TEASER ============ -->
      <section id="customers" class="mx-auto w-full max-w-[1120px] scroll-mt-20 px-6 py-20 md:py-28">
        <div class="flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-start">
          <div v-reveal>
            <p class="font-sans m-0 mb-3 text-xs font-medium uppercase tracking-[0.08em] text-[#8A8A8A]">Marketplace</p>
            <h2 class="font-sans m-0 max-w-[560px] text-[32px] font-semibold leading-[1.08] text-[#121212] md:text-[44px]">
              Start from a template.
            </h2>
            <p class="font-sans mt-4 max-w-[520px] text-[15px] leading-relaxed text-[#5F5F5F]">
              Pre-built agents from the community. One-click deploy, then make them yours.
            </p>
          </div>
          <NuxtLink
            to="/use/marketplace"
            class="font-sans group inline-flex shrink-0 items-center gap-1.5 rounded-[14px] border border-[#E3E3E3] bg-white px-5 py-2.5 text-sm font-medium text-[#121212] no-underline transition-colors duration-100 hover:bg-[#F4F4F4]"
          >
            <Store :size="15" :stroke-width="1.8" />
            All templates
            <ArrowRight :size="14" :stroke-width="2" class="transition-transform duration-150 group-hover:translate-x-[2px]" />
          </NuxtLink>
        </div>
        <div class="mt-10 grid grid-cols-3 gap-3 max-md:grid-cols-1">
          <NuxtLink
            v-for="(t, i) in templates"
            :key="t.name"
            v-reveal="i * 100"
            to="/use/marketplace"
            class="group rounded-[12px] border border-[#E3E3E3] bg-white p-6 no-underline transition-colors duration-100 hover:border-[#121212]"
          >
            <component :is="t.icon" :size="20" :stroke-width="1.6" class="text-[#273BE2]" />
            <h3 class="font-sans m-0 mb-1.5 mt-4 text-[16px] font-semibold text-[#121212]">{{ t.name }}</h3>
            <p class="font-sans m-0 text-sm leading-relaxed text-[#5F5F5F]">{{ t.desc }}</p>
            <p class="font-sans m-0 mt-4 text-xs text-[#8A8A8A]">{{ t.meta }}</p>
          </NuxtLink>
        </div>
      </section>

      <!-- ============ METRICS ============ -->
      <section class="bg-[#121212]" aria-label="Observability">
        <div class="mx-auto w-full max-w-[1120px] px-6 py-20 md:py-24">
          <div v-reveal class="flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-start">
            <div>
              <p class="font-sans m-0 mb-3 text-xs font-medium uppercase tracking-[0.08em] text-[#8A8A8A]">Observability</p>
              <h2 class="font-sans m-0 max-w-[520px] text-[32px] font-semibold leading-[1.08] text-white md:text-[44px]">
                Every agent ships with observability.
              </h2>
            </div>
            <NuxtLink to="/use/analytics" class="font-sans group inline-flex shrink-0 items-center gap-1.5 rounded-[14px] border border-white/20 px-5 py-2.5 text-sm font-medium text-white no-underline transition-colors duration-100 hover:bg-white/10">
              Open analytics
              <ArrowRight :size="14" :stroke-width="2" class="transition-transform duration-150 group-hover:translate-x-[2px]" />
            </NuxtLink>
          </div>
          <div ref="metricsRef" class="mt-14 grid grid-cols-4 gap-8 max-md:grid-cols-2">
            <div v-for="(m, i) in metricDefs" :key="m.label" v-reveal="i * 90">
              <p class="font-sans m-0 text-[52px] font-semibold leading-none tabular-nums text-white md:text-[68px]">{{ metricShown[i] }}</p>
              <p class="font-sans m-0 mt-3 text-sm text-[#A3A3A3]">{{ m.label }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ DEVELOPERS / DEPLOY ============ -->
      <section id="developers" class="mx-auto w-full max-w-[1120px] scroll-mt-20 px-6 py-20 md:py-28">
        <p v-reveal class="font-sans m-0 mb-3 text-xs font-medium uppercase tracking-[0.08em] text-[#8A8A8A]">Deploy &amp; trust</p>
        <h2 v-reveal="80" class="font-sans m-0 max-w-[640px] text-[32px] font-semibold leading-[1.08] text-[#121212] md:text-[44px]">
          Run where your data lives.
        </h2>
        <p v-reveal="140" class="font-sans mt-4 max-w-[560px] text-[15px] leading-relaxed text-[#5F5F5F]">
          Consume Accord as a service, or deploy inside your own boundary. Either way: SSO, scoped permissions, and a full audit trail.
        </p>
        <div class="mt-12 grid grid-cols-3 gap-4 max-md:grid-cols-1">
          <div v-for="(d, i) in deployOptions" :key="d.title" v-reveal="i * 100" class="group rounded-[20px] border border-[#E3E3E3] bg-white p-8 transition-all duration-200 hover:-translate-y-1 hover:border-[#121212] hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)]">
            <span class="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#F4F4F4] text-[#121212] transition-colors duration-200 group-hover:bg-[#121212] group-hover:text-white">
              <component :is="d.icon" :size="22" :stroke-width="1.7" />
            </span>
            <h3 class="font-sans m-0 mb-2 mt-5 text-[17px] font-semibold text-[#121212]">{{ d.title }}</h3>
            <p class="font-sans m-0 text-sm leading-relaxed text-[#5F5F5F]">{{ d.desc }}</p>
          </div>
        </div>
        <div v-reveal class="mt-4 flex flex-col justify-between gap-6 rounded-[20px] bg-[#121212] p-8 text-white md:flex-row md:items-center md:p-10">
          <div class="flex items-start gap-4">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white/10 text-white">
              <Github :size="22" :stroke-width="1.7" />
            </span>
            <div>
              <h3 class="font-sans m-0 text-[19px] font-semibold text-white">Open source at the core</h3>
              <p class="font-sans m-0 mt-2 max-w-[520px] text-sm leading-relaxed text-[#A3A3A3]">
                The agent runtime, eval harness, and templates are open. Inspect the code, self-host it, fork it — no black boxes running your business.
              </p>
            </div>
          </div>
          <span class="font-sans inline-flex shrink-0 items-center gap-2 self-start rounded-[12px] bg-white/10 px-4 py-2 text-[13px] font-medium text-white md:self-center">
            <Check :size="14" :stroke-width="2" class="text-[#4ADE80]" />
            MIT-licensed core
          </span>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <span v-for="b in ['SSO & SCIM', 'Scoped tool permissions', 'Full audit logs', 'Eval-gated deploys']" :key="b" class="font-sans inline-flex items-center gap-1.5 rounded-[12px] border border-[#E3E3E3] bg-[#FAFAFA] px-3.5 py-2 text-[13px] text-[#5F5F5F]">
            <FileText :size="13" :stroke-width="1.8" class="text-[#8A8A8A]" />
            {{ b }}
          </span>
        </div>
      </section>

      <!-- ============ PRICING ============ -->
      <section id="pricing" class="border-t border-[#E3E3E3] bg-[#FAFAFA]">
        <div class="mx-auto w-full max-w-[1120px] scroll-mt-20 px-6 py-20 md:py-28">
          <p v-reveal class="font-sans m-0 mb-3 text-center text-xs font-medium uppercase tracking-[0.08em] text-[#8A8A8A]">Pricing</p>
          <h2 v-reveal="80" class="font-sans m-0 mx-auto max-w-[560px] text-center text-[32px] font-semibold leading-[1.08] text-[#121212] md:text-[44px]">
            Start free. Scale when it works.
          </h2>
          <div class="mx-auto mt-10 grid max-w-[900px] grid-cols-3 gap-3 max-md:grid-cols-1">
            <div
              v-for="(t, i) in tiers"
              :key="t.name"
              v-reveal="i * 100"
              class="flex flex-col rounded-[20px] border bg-white p-6"
              :class="t.featured ? 'border-[#121212] shadow-[0_12px_40px_rgba(0,0,0,0.08)]' : 'border-[#E3E3E3]'"
            >
              <h3 class="font-sans m-0 text-sm font-semibold text-[#121212]">{{ t.name }}</h3>
              <p class="m-0 mt-3">
                <span class="font-sans text-[30px] font-medium text-[#121212]">{{ t.price }}</span>
                <span class="font-sans ml-1.5 text-xs text-[#8A8A8A]">{{ t.per }}</span>
              </p>
              <p class="font-sans m-0 mt-1.5 text-[13px] text-[#5F5F5F]">{{ t.desc }}</p>
              <ul class="font-sans m-0 mt-5 flex flex-1 flex-col gap-2 p-0" style="list-style: none;">
                <li v-for="f in t.features" :key="f" class="flex items-start gap-2 text-[13px] text-[#121212]">
                  <Check :size="14" :stroke-width="2" class="mt-[2px] shrink-0 text-[#16A34A]" />
                  {{ f }}
                </li>
              </ul>
              <NuxtLink
                v-if="t.to.startsWith('/')"
                :to="t.to"
                class="font-sans mt-6 inline-flex items-center justify-center rounded-[12px] px-4 py-2 text-[13px] font-medium no-underline transition-colors duration-100"
                :class="t.featured ? 'bg-[#121212] text-white hover:bg-[#273BE2]' : 'border border-[#E3E3E3] text-[#121212] hover:bg-[#F4F4F4]'"
              >
                {{ t.cta }}
              </NuxtLink>
              <a
                v-else
                :href="t.to"
                class="font-sans mt-6 inline-flex items-center justify-center rounded-[12px] border border-[#E3E3E3] px-4 py-2 text-[13px] font-medium text-[#121212] no-underline transition-colors duration-100 hover:bg-[#F4F4F4]"
              >
                {{ t.cta }}
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ FINAL CTA ============ -->
      <section id="cta" class="mx-auto w-full max-w-[1120px] scroll-mt-20 px-6 py-20 text-center md:py-28">
        <h2 v-reveal class="font-sans m-0 mx-auto max-w-[640px] text-[34px] font-semibold leading-[1.06] text-[#121212] md:text-[52px]">
          Your next hire is an agent.
        </h2>
        <p v-reveal="100" class="font-sans mx-auto mt-5 max-w-[480px] text-[15px] leading-relaxed text-[#5F5F5F]">
          Describe the work in plain text. Accord builds the workflow, tools, and memory — and runs it tonight.
        </p>
        <div v-reveal="180" class="mt-8 flex items-center justify-center gap-3 max-sm:flex-col max-sm:items-stretch">
          <NuxtLink
            to="/use/agent"
            class="font-sans group inline-flex items-center justify-center gap-1.5 rounded-[16px] bg-[#121212] px-6 py-3 text-sm font-medium text-white no-underline transition-colors duration-100 hover:bg-[#273BE2]"
          >
            Start building free
            <ArrowRight :size="15" :stroke-width="2" class="transition-transform duration-150 group-hover:translate-x-[2px]" />
          </NuxtLink>
          <NuxtLink
            to="/use/marketplace"
            class="font-sans inline-flex items-center justify-center rounded-[16px] border border-[#E3E3E3] bg-white px-6 py-3 text-sm font-medium text-[#121212] no-underline transition-colors duration-100 hover:bg-[#F4F4F4]"
          >
            Browse templates
          </NuxtLink>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
