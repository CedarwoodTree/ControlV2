<script setup>
import { onMounted } from 'vue';
import { InformationCircleIcon } from '@heroicons/vue/16/solid/index.js';
onMounted(() => {
  console.log('About page');
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-row w-full gap-2">
      <h1 class="text-2xl text-white fade-in ms-5 mt-4">Learn a bit more...</h1>
    </div>

    <div class="flex flex-col md:flex-row gap-4 p-5 text-white">
      <div
        class="flex-1 h-50 bg-sky-400/70 rounded shadow-2xl hover:border-2 hover:border-sky-100 p-2 fade-in"
      >
        <div class="flex flex-row gap-2">
          <InformationCircleIcon class="size-7 text-white" />
          <h5 class="mt-1 text-center font-bold">Information</h5>
        </div>
      </div>
      <div
        class="flex-1 h-50 bg-sky-400/70 rounded shadow-2xl hover:border-2 hover:border-sky-100 p-2 fade-in"
      ></div>
      <div
        class="flex-1 h-50 bg-sky-400/70 rounded shadow-2xl hover:border-2 hover:border-sky-100 p-2 fade-in"
      ></div>
    </div>
  </div>
</template>

<style scoped></style>
