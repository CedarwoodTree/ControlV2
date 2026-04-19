<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Keys
const Keys = ref([]);

const keysLoaded = ref(false); // REMEMBER KEEP AT FALSE

/*
  Key Fetching
 */
const fetchKeys = async () => {
  const response = await fetch(`/api/get-keys`);
  if (response.ok) {
    // Verify content is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return;
    }

    const responseJson = await response.json();

    if (Array.isArray(responseJson) && responseJson.length > 0) {
      Keys.value = responseJson;
      keysLoaded.value = true;
    } else {
      Keys.value = [];
    }
  } else {
    keysLoaded.value = false;
  }
};

// Open Devices Page
const goToDevicePage = (id) => {
  if (!id || isNaN(id)) {
    return;
  }
  router.push({ name: 'Device', params: { id } });
};

onMounted(() => {
  fetchKeys();
});
</script>

<template>
  <h1 class="text-2xl text-white mt-2 ms-2 fade-in">Home</h1>
  <div class="flex flex-col md:flex-row gap-4 text-white p-2">
    <div class="flex-1 flex flex-col gap-3 text-white fade-in">
      <h2 class="text-white/70">Manage Your Devices</h2>
      <div v-if="!keysLoaded">
        <p class="text-red-400">No keys Found.</p>
      </div>
      <div
        v-for="key in Keys"
        :key="'key-' + key.key_id"
        class="flex flex-row items-center justify-between border-b-1 border-b-sky-400 py-2 mx-1"
      >
        <h5 class="text-3xl text-sky-400">{{ key.name }}</h5>
        <button
          class="bg-sky-400/70 p-1 rounded shadow-lg hover:bg-sky-600/70 hover:cursor-pointer"
          @click="goToDevicePage(key.key_id)"
        >
          Manage
        </button>
      </div>
    </div>

    <!--    <div class="flex-1 flex flex-col text-white fade-in">-->
    <!--      <h2 class="text-white/70">Placeholder Column</h2>-->
    <!--    </div>-->
  </div>
</template>

<style scoped></style>
