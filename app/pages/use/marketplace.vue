<script setup lang="ts">
definePageMeta({ layout: 'use' })
</script>

<template>
  <div class="font-sans unmodified-font-sans p-6">
    <h1 class="unmodified-font-sans m-0 mb-1 text-xl font-medium tracking-[-0.01em] text-[#121212]">Marketplace</h1>
    <p class="unmodified-font-sans m-0 mb-[18px] text-sm text-[#6B6B6B]">Discover pre-built agents from the community.</p>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
      <div
        v-for="i in 6"
        :key="i"
        class="rounded-[10px] border border-[#E3E3E3] bg-white p-4 transition-colors duration-100 hover:bg-[#EBEBEB]"
      >
        <div class="mb-2.5 text-xl text-[#273BE2]">{{ ['✦','◍','⬡','✧','⬢','○'][i-1] }}</div>
        <div class="unmodified-font-sans text-[13.5px] font-medium text-[#121212]">Agent template {{ i }}</div>
        <div class="unmodified-font-sans mt-1 text-xs text-[#6B6B6B]">One-click deploy · 4.8 ★ · 2k runs</div>
      </div>
    </div>
  </div>
</template>
