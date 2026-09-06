<script setup lang="ts">
import { SmoothCorners } from "@lisse/vue";
import { ArrowUp, Plus, X } from "@lucide/vue";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

type PickerItem = {
  name: string;
  desc: string;
};

const tools: PickerItem[] = [
  { name: "Web search", desc: "Search the web for up-to-date info" },
  { name: "Code runner", desc: "Execute code to answer questions" },
  { name: "Image gen", desc: "Generate images from text" },
];

const skills: PickerItem[] = [
  { name: "Support tone", desc: "Reply in your support voice" },
  { name: "Summariser", desc: "Condense long threads and docs" },
  { name: "Reviewer", desc: "Review work against a style guide" },
];

// Mock rotation for now — later swapped for a live backend feed
// pushing into the same `creationStepIndex` / `currentStepText`.
const creationSteps = [
  "Creating your agent",
  "Planning workflow…",
  "Connecting tools…",
  "Setting up memory…",
];

const message = ref("");
const messages = ref<ChatMessage[]>([]);
const isLoading = ref(false);
const requestError = ref("");
const isPickerOpen = ref(false);
const selectedTools = ref<string[]>([]);
const selectedSkills = ref<string[]>([]);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const messageListRef = ref<HTMLElement | null>(null);
const pickerRef = ref<HTMLElement | null>(null);

const creationPhase = ref<"idle" | "creating">("idle");
const creationStepIndex = ref(0);
const abortController = ref<AbortController | null>(null);
const stepTimer = ref<ReturnType<typeof setInterval> | null>(null);
const pendingDraft = ref("");

const hasMessages = computed(() => messages.value.length > 0);
const canSend = computed(
  () => message.value.trim().length > 0 && !isLoading.value && creationPhase.value === "idle",
);
const isCreating = computed(() => creationPhase.value === "creating");
const currentStepText = computed(() => creationSteps[creationStepIndex.value] ?? creationSteps[0]!);

const MAX_TEXTAREA_HEIGHT = 200;

function adjustHeight() {
  const textarea = textareaRef.value;
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
}

function getResponseText(response: unknown) {
  if (typeof response === "string") return response;
  if (response && typeof response === "object" && "message" in response) {
    const text = (response as { message?: unknown }).message;
    if (typeof text === "string") return text;
  }
  return "Pointer returned an empty response. Please try again.";
}

async function scrollToBottom() {
  await nextTick();
  const list = messageListRef.value;
  if (!list) return;
  list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
}

function startMockSteps() {
  stopMockSteps();
  creationStepIndex.value = 0;
  stepTimer.value = setInterval(() => {
    creationStepIndex.value = (creationStepIndex.value + 1) % creationSteps.length;
  }, 2000);
}

function stopMockSteps() {
  if (stepTimer.value) {
    clearInterval(stepTimer.value);
    stepTimer.value = null;
  }
}

function morphBackToInput() {
  stopMockSteps();
  abortController.value = null;
  creationPhase.value = "idle";
  message.value = pendingDraft.value;
  pendingDraft.value = "";
  nextTick(() => {
    adjustHeight();
    textareaRef.value?.focus();
  });
}

function abortCreation() {
  abortController.value?.abort();
  morphBackToInput();
}

async function sendMessage() {
  const userMessage = message.value.trim();
  if (!userMessage || isLoading.value || isCreating.value) return;
  requestError.value = "";
  isPickerOpen.value = false;
  pendingDraft.value = userMessage;
  messages.value.push({ id: Date.now(), role: "user", content: userMessage });
  message.value = "";
  isLoading.value = true;
  creationPhase.value = "creating";
  creationStepIndex.value = 0;
  startMockSteps();
  abortController.value = new AbortController();
  await nextTick(adjustHeight);
  await scrollToBottom();
  try {
    const response = await $fetch<unknown>("/api/apps/chat", {
      method: "POST",
      body: { userMessage },
      signal: abortController.value.signal,
    });
    messages.value.push({
      id: Date.now() + 1,
      role: "assistant",
      content: getResponseText(response),
    });
    morphBackToInput();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    requestError.value = "Pointer could not respond right now. Please try again.";
    morphBackToInput();
  } finally {
    isLoading.value = false;
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
}

function toggleSelect(list: Ref<string[]>, name: string) {
  const idx = list.value.indexOf(name);
  if (idx === -1) list.value.push(name);
  else list.value.splice(idx, 1);
}

function handleClickOutside(event: MouseEvent) {
  const picker = pickerRef.value;
  if (!picker) return;
  if (!picker.contains(event.target as Node)) isPickerOpen.value = false;
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === "Escape") isPickerOpen.value = false;
}

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleEscape);
  adjustHeight();
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  document.removeEventListener("keydown", handleEscape);
  stopMockSteps();
  abortController.value?.abort();
});

watch(message, () => nextTick(adjustHeight));
</script>

<template>
  <div class="flex w-full flex-col gap-y-4">
    <!-- Message list -->
    <div
      v-if="hasMessages || isLoading || requestError"
      ref="messageListRef"
      class="noscrollbar flex max-h-[50vh] min-h-0 flex-col gap-y-4 overflow-y-auto px-1 py-1"
      aria-live="polite"
    >
      <div
        v-for="chatMessage in messages"
        :key="chatMessage.id"
        :class="chatMessage.role === 'user' ? 'flex justify-end' : 'flex justify-start'"
      >
        <SmoothCorners
          v-if="chatMessage.role === 'user'"
          as-child
          :corners="{ radius: 18, smoothing: 0.6 }"
        >
          <span
            v-gsap.entrance.fade
            class="unmodified-font-sans max-w-[80%] whitespace-pre-wrap bg-[#121212] px-3.5 py-2 text-sm leading-6 text-white"
          >
            {{ chatMessage.content }}
          </span>
        </SmoothCorners>
        <p
          v-else
          v-gsap.entrance.fade
          class="unmodified-font-sans max-w-[85%] whitespace-pre-wrap text-sm leading-6 text-[#121212]"
        >
          {{ chatMessage.content }}
        </p>
      </div>
      <p v-if="requestError" class="unmodified-font-sans text-sm text-[#B42318]">
        {{ requestError }}
      </p>
    </div>

    <!-- Input / loading pill swap zone -->
    <div class="relative flex min-h-[132px] w-full items-center justify-center">
      <GSAPTransition :hidden="{ opacity: 0, y: 12, scale: 0.97 }" :duration="0.35">
        <!-- Input box -->
        <div
          v-if="!isCreating"
          key="chat-input"
          v-gsap.entrance.slide-bottom
          class="relative w-full"
        >
          <!-- Tools / skills picker -->
          <GSAPTransition :hidden="{ opacity: 0, y: 8, scale: 0.98 }" :duration="0.22">
            <div
              v-if="isPickerOpen"
              ref="pickerRef"
              class="absolute bottom-full left-0 z-50 mb-2 w-72"
            >
              <SmoothCorners
                as-child
                :corners="{ radius: 16, smoothing: 0.6 }"
                :middle-border="{ width: 1, color: '#E3E3E3', opacity: 1 }"
              >
                <div class="bg-white p-1.5">
                  <p class="unmodified-font-sans px-2 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-[#8A8A8A]">
                    Tools
                  </p>
                  <button
                    v-for="tool in tools"
                    :key="tool.name"
                    type="button"
                    class="unmodified-font-sans flex w-full items-center justify-between gap-x-2 rounded-[10px] px-2 py-1.5 text-left transition-colors duration-100 hover:bg-[#F4F4F4]"
                    @click="toggleSelect(selectedTools, tool.name)"
                  >
                    <span>
                      <span class="block text-[13px] font-medium text-[#121212]">{{ tool.name }}</span>
                      <span class="block text-xs text-[#6B6B6B]">{{ tool.desc }}</span>
                    </span>
                    <span
                      :class="[
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]',
                        selectedTools.includes(tool.name)
                          ? 'border-[#121212] bg-[#121212] text-white'
                          : 'border-[#E3E3E3] text-transparent',
                      ]"
                    >
                      ✓
                    </span>
                  </button>
                  <div class="mx-2 my-1.5 h-px bg-[#F4F4F4]" />
                  <p class="unmodified-font-sans px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wide text-[#8A8A8A]">
                    Skills
                  </p>
                  <button
                    v-for="skill in skills"
                    :key="skill.name"
                    type="button"
                    class="unmodified-font-sans flex w-full items-center justify-between gap-x-2 rounded-[10px] px-2 py-1.5 text-left transition-colors duration-100 hover:bg-[#F4F4F4]"
                    @click="toggleSelect(selectedSkills, skill.name)"
                  >
                    <span>
                      <span class="block text-[13px] font-medium text-[#121212]">{{ skill.name }}</span>
                      <span class="block text-xs text-[#6B6B6B]">{{ skill.desc }}</span>
                    </span>
                    <span
                      :class="[
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]',
                        selectedSkills.includes(skill.name)
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
          class="flex items-center justify-center gap-x-2"
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
</template>
