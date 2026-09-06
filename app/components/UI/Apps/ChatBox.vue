<script setup lang="ts">
import { SmoothCorners } from "@lisse/vue";
import { ArrowUp, ChevronRight, Plus, Sparkles, Wrench, X } from "@lucide/vue";
import { useAgentChat } from "~/composables/useAgentChat";

type PickerItem = {
  name: string;
  desc: string;
  logo?: string;
};

// Placeholder entries — swap in real brand marks under public/integrations/ later.
const tools: PickerItem[] = [
  { name: "Gmail", desc: "Read and draft emails", logo: "/integrations/gmail.svg" },
  { name: "Ramp", desc: "Track spend and approvals", logo: "/integrations/ramp.svg" },
  { name: "Slack", desc: "Post and reply in channels", logo: "/integrations/slack.svg" },
  { name: "Google Drive", desc: "Search docs and files", logo: "/integrations/drive.svg" },
];

const skills: PickerItem[] = [
  { name: "Support tone", desc: "Reply in your support voice" },
  { name: "Summariser", desc: "Condense long threads and docs" },
  { name: "Reviewer", desc: "Review work against a style guide" },
];

// Chat state lives in the composable: page -> useAgentChat -> /api/agent/chat -> FastAPI.
// The loading pill (`currentStepText`) is driven by backend `step` events,
// falling back to a local rotation only while the backend sends none.
const {
  messages,
  isLoading,
  isCreating,
  currentStepText,
  requestError,
  sendAgentMessage,
  abortAgentCreation,
} = useAgentChat();

const message = ref("");
const isPickerOpen = ref(false);
const activeFlyout = ref<"tools" | "skills" | null>(null);
const selectedTools = ref<string[]>([]);
const selectedSkills = ref<string[]>([]);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const messageListRef = ref<HTMLElement | null>(null);
const pickerRef = ref<HTMLElement | null>(null);

const pendingDraft = ref("");
const abortedRef = ref(false);

const hasMessages = computed(() => messages.value.length > 0);
const hasStarted = computed(() => messages.value.length > 0 || isCreating.value);
const hasDraft = computed(() => message.value.trim().length > 0);
const showHero = computed(() => !hasDraft.value && !hasStarted.value);
const canSend = computed(
  () => message.value.trim().length > 0 && !isLoading.value && !isCreating.value,
);
const flyoutItems = computed(() => (activeFlyout.value === "skills" ? skills : tools));

const MAX_TEXTAREA_HEIGHT = 200;

function adjustHeight() {
  const textarea = textareaRef.value;
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
}

async function scrollToBottom() {
  await nextTick();
  const list = messageListRef.value;
  if (!list) return;
  list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
}

function restoreDraft() {
  message.value = pendingDraft.value;
  pendingDraft.value = "";
  nextTick(() => {
    adjustHeight();
    textareaRef.value?.focus();
  });
}

function abortCreation() {
  abortedRef.value = true;
  abortAgentCreation();
  restoreDraft();
}

async function sendMessage() {
  const userMessage = message.value.trim();
  if (!userMessage || isLoading.value || isCreating.value) return;
  requestError.value = "";
  abortedRef.value = false;
  isPickerOpen.value = false;
  activeFlyout.value = null;
  pendingDraft.value = userMessage;
  message.value = "";
  await nextTick(adjustHeight);
  await scrollToBottom();
  try {
    await sendAgentMessage(userMessage, {
      tools: selectedTools.value,
      skills: selectedSkills.value,
    });
    pendingDraft.value = "";
  } catch (error) {
    if (abortedRef.value) return;
    if (error instanceof DOMException && error.name === "AbortError") return;
    // `requestError` is already set inside the composable — restore the draft for retry.
    restoreDraft();
  } finally {
    await scrollToBottom();
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function togglePicker() {
  isPickerOpen.value = !isPickerOpen.value;
  if (!isPickerOpen.value) activeFlyout.value = null;
}

function toggleFlyout(which: "tools" | "skills") {
  activeFlyout.value = activeFlyout.value === which ? null : which;
}

function toggleSelect(list: Ref<string[]>, name: string) {
  const idx = list.value.indexOf(name);
  if (idx === -1) list.value.push(name);
  else list.value.splice(idx, 1);
}

function handleClickOutside(event: MouseEvent) {
  const picker = pickerRef.value;
  if (!picker) return;
  if (!picker.contains(event.target as Node)) {
    isPickerOpen.value = false;
    activeFlyout.value = null;
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === "Escape") {
    isPickerOpen.value = false;
    activeFlyout.value = null;
  }
}

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleEscape);
  adjustHeight();
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  document.removeEventListener("keydown", handleEscape);
  abortAgentCreation();
});

watch(message, () => nextTick(adjustHeight));
</script>

<template>
  <div class="flex h-full min-h-0 w-full flex-col">
    <!-- Message list -->
    <div
      v-if="hasStarted || requestError"
      ref="messageListRef"
      class="noscrollbar min-h-0 flex-1 overflow-y-auto px-1 py-1"
      aria-live="polite"
    >
      <GSAPTransition group :stagger="0.06" :hidden="{ opacity: 0, y: 10 }" :duration="0.3">
        <div
          v-for="(chatMessage, idx) in messages"
          :key="chatMessage.id"
          :data-index="idx"
          :class="[
            'flex',
            chatMessage.role === 'user' ? 'justify-end' : 'justify-start',
            idx > 0 ? 'mt-4' : '',
          ]"
        >
          <SmoothCorners
            v-if="chatMessage.role === 'user'"
            as-child
            :corners="{ radius: 18, smoothing: 0.6 }"
          >
            <span
              class="unmodified-font-sans max-w-[80%] whitespace-pre-wrap bg-[#0A84FF] px-3.5 py-2 text-sm leading-6 text-white"
            >
              {{ chatMessage.content }}
            </span>
          </SmoothCorners>
          <!-- Plain paragraph for now — comark Markdown drops in here later -->
          <p
            v-else
            class="unmodified-font-sans max-w-[85%] whitespace-pre-wrap text-sm leading-6 text-[#121212]"
          >
            {{ chatMessage.content }}
          </p>
        </div>
      </GSAPTransition>
      <p v-if="requestError" class="unmodified-font-sans mt-4 text-sm text-[#B42318]">
        {{ requestError }}
      </p>
    </div>

    <!-- Dock: hero (idle) + input/pill, centered idle, bottom docked active -->
    <div :class="['w-full shrink-0', hasStarted ? 'pb-2 pt-4' : 'my-auto flex flex-col']">
      <GSAPTransition :hidden="{ opacity: 0, y: -10 }" :duration="0.3">
        <div v-if="showHero" class="mb-[22px] text-center">
          <h1 class="unmodified-font-sans m-0 mb-2 text-[26px] font-medium tracking-[-0.02em] text-[#121212]">What should your agent do?</h1>
          <p class="unmodified-font-sans m-0 text-sm text-[#6B6B6B]">Describe it in plain text — Accord builds the workflow, tools and memory for you.</p>
        </div>
      </GSAPTransition>

      <div class="relative w-full">
        <GSAPTransition :hidden="{ opacity: 0, y: 12, scale: 0.97 }" :duration="0.35">
          <!-- Input box -->
          <div
            v-if="!isCreating"
            key="chat-input"
            class="relative w-full"
          >
            <!-- Tools / skills picker -->
            <GSAPTransition :hidden="{ opacity: 0, y: 8, scale: 0.98 }" :duration="0.22">
              <div
                v-if="isPickerOpen"
                ref="pickerRef"
                class="absolute bottom-full left-0 z-50 mb-2"
                @mouseleave="activeFlyout = null"
              >
                <SmoothCorners
                  as-child
                  :corners="{ radius: 16, smoothing: 0.6 }"
                  :middle-border="{ width: 1, color: '#E3E3E3', opacity: 1 }"
                >
                  <div class="w-64 bg-white p-1.5">
                    <button
                      type="button"
                      class="unmodified-font-sans flex w-full items-center gap-x-2 rounded-[10px] px-2 py-2 text-left transition-colors duration-100 hover:bg-[#F4F4F4]"
                      @mouseenter="activeFlyout = 'tools'"
                      @focus="activeFlyout = 'tools'"
                      @click="toggleFlyout('tools')"
                    >
                      <Wrench :size="15" :stroke-width="1.8" class="shrink-0 text-[#6B6B6B]" />
                      <span class="flex-1">
                        <span class="block text-[13px] font-medium text-[#121212]">Tools</span>
                        <span class="block text-xs text-[#6B6B6B]">Connect Gmail, Ramp and more</span>
                      </span>
                      <ChevronRight :size="14" class="shrink-0 text-[#8A8A8A]" />
                    </button>
                    <button
                      type="button"
                      class="unmodified-font-sans flex w-full items-center gap-x-2 rounded-[10px] px-2 py-2 text-left transition-colors duration-100 hover:bg-[#F4F4F4]"
                      @mouseenter="activeFlyout = 'skills'"
                      @focus="activeFlyout = 'skills'"
                      @click="toggleFlyout('skills')"
                    >
                      <Sparkles :size="15" :stroke-width="1.8" class="shrink-0 text-[#6B6B6B]" />
                      <span class="flex-1">
                        <span class="block text-[13px] font-medium text-[#121212]">Skills</span>
                        <span class="block text-xs text-[#6B6B6B]">Give your agent abilities</span>
                      </span>
                      <ChevronRight :size="14" class="shrink-0 text-[#8A8A8A]" />
                    </button>
                  </div>
                </SmoothCorners>

                <!-- External flyout -->
                <GSAPTransition :hidden="{ opacity: 0, x: -8, scale: 0.98 }" :duration="0.22">
                  <div
                    v-if="activeFlyout"
                    :key="activeFlyout"
                    class="absolute left-full top-0 z-50 ml-2 w-64 max-w-[70vw]"
                  >
                    <SmoothCorners
                      as-child
                      :corners="{ radius: 16, smoothing: 0.6 }"
                      :middle-border="{ width: 1, color: '#E3E3E3', opacity: 1 }"
                    >
                      <div class="max-h-72 overflow-y-auto bg-white p-1.5">
                        <button
                          v-for="item in flyoutItems"
                          :key="item.name"
                          type="button"
                          class="unmodified-font-sans flex w-full items-center gap-x-2 rounded-[10px] px-2 py-1.5 text-left transition-colors duration-100 hover:bg-[#F4F4F4]"
                          @click="toggleSelect(activeFlyout === 'skills' ? selectedSkills : selectedTools, item.name)"
                        >
                          <img
                            v-if="item.logo"
                            :src="item.logo"
                            width="16"
                            height="16"
                            :alt="`${item.name} logo`"
                            class="h-4 w-4 shrink-0"
                          />
                          <span class="flex-1">
                            <span class="block text-[13px] font-medium text-[#121212]">{{ item.name }}</span>
                            <span class="block text-xs text-[#6B6B6B]">{{ item.desc }}</span>
                          </span>
                          <span
                            :class="[
                              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]',
                              (activeFlyout === 'skills' ? selectedSkills : selectedTools).includes(item.name)
                                ? 'border-[#121212] bg-[#121212] text-white'
                                : 'border-[#E3E3E3] text-transparent',
                            ]"
                          >
                            ✓
                          </span>
                        </button>
                      </div>
                    </SmoothCorners>
                  </div>
                </GSAPTransition>
              </div>
            </GSAPTransition>

            <SmoothCorners
              as-child
              :corners="{ radius: 24, smoothing: 0.6 }"
              :middle-border="{ width: 1, color: '#E3E3E3', opacity: 1 }"
            >
              <div class="flex flex-col gap-y-1 bg-white p-2">
                <textarea
                  ref="textareaRef"
                  v-model="message"
                  autofocus
                  rows="1"
                  placeholder="Describe what your agent should do…"
                  aria-label="Describe your agent"
                  class="unmodified-font-sans max-h-[200px] resize-none overflow-y-auto bg-transparent px-2 pb-1 pt-1.5 text-sm font-normal text-[#121212] outline-none placeholder:text-[#8A8A8A]"
                  @keydown="handleKeyDown"
                />
                <div class="flex w-full items-center justify-between">
                  <button
                    v-gsap.whileHover.to="{ scale: 1.08 }"
                    type="button"
                    aria-label="Add tools or skills"
                    :aria-expanded="isPickerOpen"
                    class="flex h-8 w-8 items-center justify-center rounded-full text-[#6B6B6B] transition-colors duration-150 hover:bg-[#F4F4F4] hover:text-[#121212]"
                    @click="togglePicker"
                  >
                    <Plus :size="18" :stroke-width="1.8" />
                  </button>
                  <button
                    v-gsap.whileHover.to="{ scale: 1.08 }"
                    type="button"
                    aria-label="Send message"
                    :disabled="!canSend"
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-[#121212] transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-30"
                    @click="sendMessage"
                  >
                    <ArrowUp :size="16" :stroke-width="2" color="#fff" />
                  </button>
                </div>
              </div>
            </SmoothCorners>
          </div>

          <!-- Loading pill + stop button -->
          <div
            v-else
            key="creating-pill"
            class="flex w-full items-center justify-center gap-x-2"
            role="status"
            aria-label="Creating your agent"
          >
            <SmoothCorners
              as-child
              :corners="{ radius: 999, smoothing: 0.6 }"
              :middle-border="{ width: 1, color: '#E3E3E3', opacity: 1 }"
            >
              <div class="flex h-11 w-[320px] max-w-full items-center justify-center bg-white px-4">
                <GSAPTransition :hidden="{ opacity: 0, y: 6 }" :duration="0.25">
                  <span
                    :key="currentStepText"
                    class="loading-shimmer unmodified-font-sans truncate text-sm font-medium"
                    aria-live="polite"
                  >
                    {{ currentStepText }}
                  </span>
                </GSAPTransition>
              </div>
            </SmoothCorners>
            <button
              v-gsap.whileHover.to="{ scale: 1.1 }"
              type="button"
              aria-label="Stop creating agent"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#121212] transition-opacity duration-150 hover:opacity-85"
              @click="abortCreation"
            >
              <X :size="14" :stroke-width="2" color="#fff" />
            </button>
          </div>
        </GSAPTransition>
      </div>
    </div>
  </div>
</template>
