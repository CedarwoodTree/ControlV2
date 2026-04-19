<script setup>
import Modal from '@/components/Modal.vue';
import { onMounted, ref } from 'vue';
import { KeyIcon, TrashIcon } from '@heroicons/vue/24/outline';

// Keys
const Keys = ref([]);

const keysLoaded = ref(false); // REMEMBER KEEP AT FALSE
const keyCreationStatusMessage = ref('');
const showModal = ref(false);
const deleteKeyFocus = ref({
  key_id: false,
});

const createKeyFormValues = ref({
  name: '',
  content: '',
});

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

/*
  Key Creation
 */
const createKey = async (e) => {
  e.preventDefault();

  try {
    keyCreationStatusMessage.value = 'Creating Key...';

    const response = await fetch(`/api/create-key`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: createKeyFormValues.value.name,
        content: createKeyFormValues.value.content,
      }),
    });

    if (response.ok) {
      keyCreationStatusMessage.value = 'key Successfully Created!';
    } else {
      keyCreationStatusMessage.value = 'Failed to Create Key';
    }
  } catch (e) {
    keyCreationStatusMessage.value = 'Failed to create key.';
  }

  await fetchKeys();

  setTimeout(() => {
    keyCreationStatusMessage.value = '';
  }, 2000);
};

/*
  Key Deletion
 */
const showDeleteKeyModal = async (key_id) => {
  if (!key_id || isNaN(key_id)) {
    return;
  }

  deleteKeyFocus.value.key_id = key_id;
  showModal.value = true;
};

const deleteKey = async () => {
  if (!deleteKeyFocus.value.key_id || isNaN(deleteKeyFocus.value.key_id)) {
    return;
  }

  try {
    const response = await fetch(`/api/delete-key`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        key_id: deleteKeyFocus.value.key_id,
      }),
    });

    await fetchKeys();
    showModal.value = false;
  } catch (e) {
    console.log(e);
  }
};

onMounted(() => {
  fetchKeys();
});
</script>

<template>
  <!-- Delete Key Modal -->
  <teleport to="body">
    <Modal :show="showModal">
      <template #header>
        <div class="flex flex-row gap-1 items-center text-white">
          <TrashIcon class="size-6" />
          <h1 class="text-2xl">Delete Key</h1>
        </div>
      </template>
      <template #body>
        <div class="flex flex-col gap-1 mt-2 text-white/70 p-1">
          <p>
            Are you sure you want to delete key with id
            <strong>{{ deleteKeyFocus.key_id }}</strong
            >?
          </p>
          <button
            class="bg-amber-500 rounded mt-2 font-bold hover:bg-amber-600 hover:cursor-pointer"
            @click="deleteKey"
          >
            Yes
          </button>
          <button
            class="bg-sky-500/70 rounded font-bold hover:bg-sky-600/70 hover:cursor-pointer"
            @click="showModal = false"
          >
            No
          </button>
        </div>
      </template>
    </Modal>
  </teleport>

  <!-- Main Content -->
  <div class="flex flex-col text-white mt-4 p-1 mx-auto">
    <h1 class="text-2xl text-white mt-2 ms-2 fade-in">Keys</h1>
    <p class="text-lg text-white/70 mt-2 ms-2 mb-2 fade-in">
      These are the currently active Govee API keys.
    </p>

    <!-- Display Keys Section   -->
    <div v-if="keysLoaded">
      <div
        v-for="key in Keys"
        class="flex flex-col mb-4 fade-in md:px-2"
        :key="'key-' + key.key_id"
      >
        <div class="flex flex-row gap-3 items-center border-b-1 border-sky-400 p-2">
          <KeyIcon class="size-6 text-sky-400"></KeyIcon>
          <h5 class="text-2xl text-sky-400">{{ key.name }}</h5>
        </div>

        <div
          class="flex flex-col md:flex-row gap-3 items-start md:items-center mt-3 justify-between"
        >
          <p>
            <strong>Last Used:</strong> {{ new Date(key.last_used).toLocaleString() }}
            <strong> | ID: </strong>
            {{ key.key_id }}
          </p>
          <div>
            <button
              class="text-center font-bold w-75 bg-red-500/90 md:w-20 rounded p-1 hover:cursor-pointer hover:bg-red-600/90"
              @click="showDeleteKeyModal(key.key_id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!keysLoaded" class="text-red-400 fade-in">
      <p class="ms-2">No Keys Found.</p>
    </div>

    <!-- Create Key Section -->
    <div class="mt-5 fade-in">
      <h1 class="text-2xl text-white mt-8 ms-2 fade-in">Create Key</h1>
      <p class="text-lg text-white/70 mt-2 ms-2 fade-in">
        Use the form below to create a key.
      </p>

      <div class="flex flex-col gap-3 mt-4 shadow-lg border-b-1 border-b-sky-400">
        <form class="p-3" @submit="createKey">
          <div class="mb-4">
            <label class="text-lg font-bold">Key Name</label>
            <p class="mt-1 text-white/70">
              Key names do not need to be unique, but must be under 50 characters in
              length.
            </p>
            <input
              v-model="createKeyFormValues.name"
              type="text"
              required
              class="w-full p-2 mt-4 border rounded"
              maxlength="50"
              minlength="5"
              placeholder="Enter key name..."
            />
          </div>

          <div class="mb-6">
            <label class="text-lg font-bold">API Key</label>
            <p class="mt-1 text-white/70">This is the key given to you by Govee.</p>
            <input
              v-model="createKeyFormValues.content"
              type="text"
              required
              class="w-full p-2 mt-4 border rounded"
              maxlength="50"
              minlength="5"
              placeholder="Enter key..."
            />
          </div>
          <button
            type="submit"
            class="mb-4 w-full bg-sky-400/70 rounded p-2 hover:cursor-pointer hover:bg-sky-500/70"
          >
            Submit Key
          </button>
          <p class="text-center mb-3">{{ keyCreationStatusMessage }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
