<script setup>
const props = defineProps(['isOpen', 'openMethod']);
</script>

<template>
  <div
    class="w-64 flex flex-col bg-gray-900 h-screen fixed right-0 top-0 transition-transform duration-300 z-50 text-white border-l-1 border-gray-500"
    :class="{ 'translate-x-full': !isOpen }"
  >
    <button @click="openMethod"><slot name="sidebar-close-icon"></slot></button>
  </div>
</template>

<style scoped></style>
