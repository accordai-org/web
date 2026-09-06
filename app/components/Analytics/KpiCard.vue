<script setup lang="ts">
defineProps<{
  label: string
  value: string
  sub?: string
  pending?: boolean
}>()
</script>

<template>
  <div
    class="flex flex-col gap-0.5 rounded-[10px] border border-[#E3E3E3] bg-white p-3.5"
    :class="pending ? 'opacity-70' : ''"
  >
    <span class="flex items-center gap-1.5">
      <span class="unmodified-font-sans text-xl font-medium text-[#121212]">{{ value }}</span>
      <span
        v-if="pending"
        class="unmodified-font-sans rounded-full bg-[#F4F4F4] px-1.5 py-px text-[10px] font-medium text-[#6B6B6B]"
      >
        Pricing soon
      </span>
    </span>
    <span class="unmodified-font-sans text-xs text-[#6B6B6B]">{{ label }}</span>
    <span v-if="sub" class="unmodified-font-sans text-[11px]" :class="sub.startsWith('-') ? 'text-[#16A34A]' : sub.startsWith('+') ? 'text-[#B42318]' : 'text-[#8A8A8A]'">
      {{ sub }}
    </span>
  </div>
</template>
