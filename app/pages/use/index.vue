<script setup lang="ts">
definePageMeta({ layout: 'use' })
// Default /use landing -> /use/agent (new agent via text)
await navigateTo('/use/agent', { replace: true })
</script>

<template>
  <div />
</template>
