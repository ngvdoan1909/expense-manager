<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: String, required: true },
  tone: { type: String, default: 'neutral' },
})
</script>

<template>
  <div class="rounded-md border border-stone-200 bg-white p-5">
    <p class="text-sm font-medium text-stone-500">{{ title }}</p>
    <p
      class="mt-3 break-words text-2xl font-bold"
      :class="{
        'text-brand': tone === 'income',
        'text-accent': tone === 'expense',
        'text-ink': tone === 'neutral',
      }"
    >
      {{ value }}
    </p>
  </div>
</template>
