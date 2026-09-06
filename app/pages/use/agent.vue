<script setup lang="ts">
definePageMeta({ layout: 'use' })
</script>

<template>
  <div class="font-sans unmodified-font-sans mx-auto flex min-h-full w-full max-w-[640px] flex-col justify-center px-6 py-8">
    <div class="mb-[22px] text-center">
      <h1 class="unmodified-font-sans m-0 mb-2 text-[26px] font-medium tracking-[-0.02em] text-[#121212]">What should your agent do?</h1>
      <p class="unmodified-font-sans m-0 text-sm text-[#6B6B6B]">Describe it in plain text — Accord builds the workflow, tools and memory for you.</p>
    </div>

    <UIAppsChatBox />
  </div>
</template>
