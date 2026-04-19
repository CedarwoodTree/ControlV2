<script setup>
import { ref } from 'vue';

const refreshDeviceStatus = ref({
  status: 'Refresh Device Lists',
});

const refreshDeviceList = async () => {
  refreshDeviceStatus.value.status = 'Refreshing..';
  try {
    const response = await fetch('/api/refresh-devices');

    if (response && response.ok) {
      refreshDeviceStatus.value.status = 'Device List Refreshed';
    } else {
      refreshDeviceStatus.value.status = 'Failed to refresh, please try again later';
    }

    setTimeout(() => {
      refreshDeviceStatus.value.status = 'Refresh Device Lists';
    }, 1200);
  } catch (e) {
    console.log(e);
  }
};
</script>

<template>
  <h1 class="text-2xl text-white mt-2 ms-2 fade-in">Settings</h1>
  <div class="flex flex-col text-white fade-in">
    <p class="ms-2 text-white/70 border-b-1 boder-b-white py-2">
      Edit the site settings below.
    </p>
    <div class="flex flex-col gap-2 mx-2 mt-4">
      <h2 class="text-lg mb-4">General</h2>
      <div class="flex flex-col md:flex-row items-center justify-between">
        <button
          class="w-100 bg-amber-600 rounded p-1 shadow-lg hover:bg-amber-700 hover:cursor-pointer"
          @click="refreshDeviceList"
        >
          {{ refreshDeviceStatus.status }}
        </button>
        <p class="text-white/70 mt-2 md:mt-0">
          It is not recommended to refresh often, as this is heavy on API usage.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
