<script setup>
// Imports
import { ArrowLeftIcon, LightBulbIcon } from '@heroicons/vue/24/solid';
import { useRouter } from 'vue-router';
import { onMounted, ref, computed } from 'vue';
import Modal from '@/components/Modal.vue';

const router = useRouter();

// Props
const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
});

// General Refs
const showModal = ref(false);
const modalInfo = ref({
  db: true,
  device_name: 'None',
  device_id: null,
  sku: null,
  status: '',
});
const Devices = ref([]);
const DevicesLoaded = ref(false); // MUST BE FALSE

/*
  Load Devices
  ------------
  Loads cached list of devices from backend
 */
const loadDevices = async () => {
  try {
    const response = await fetch(`/api/devices/${props.id}`);

    if (response && response.ok) {
      const responseJson = await response.json();

      if (responseJson && Array.isArray(responseJson) && responseJson.length > 0) {
        // Devices.value = responseJson[0];
        const ResponseContent = JSON.parse(responseJson[0]?.content);

        Devices.value = [
          {
            devicelist_id: responseJson[0].devicelist_id,
            key_id: responseJson[0].key_id,
            content: ResponseContent,
            last_updated: responseJson[0].last_updated,
          },
        ];

        DevicesLoaded.value = true;
      }
    }
  } catch (e) {
    console.log(e);
  }
};

const showDeviceModal = (db, name, id, sku) => {
  if (!name || !id || !sku) {
    return;
  }

  modalInfo.value.status = '';

  if (db) {
    modalInfo.value.db = true;
  } else {
    modalInfo.value.db = false;
  }

  modalInfo.value.device_name = name;
  modalInfo.value.device_id = id;
  modalInfo.value.sku = sku;

  showModal.value = true;
};

const showDeviceStatusModal = ref(false);

const deviceStatusDefaults = () => ({
  success: false,
  message: '',
  brightness: 0,
  color: 2552552555,
  on: false,
  name: 'Unknown',
  state: 'Light Status',
});

const deviceStatusInfo = ref(deviceStatusDefaults());

const cssColor = computed(() => {
  const val = deviceStatusInfo.value.color;
  if (val == null) return '#ffffff';

  const r = (val >> 16) & 0xff;
  const g = (val >> 8) & 0xff;
  const b = val & 0xff;

  return `rgb(${r}, ${g}, ${b})`;
});

/*
  Grab Device Status
  -------------
  Grabs the power state of device from the backend
 */
const fetchDeviceStatus = async (devicelist_id, device_id, key_id, device_name) => {
  deviceStatusInfo.value = deviceStatusDefaults(); // Reset Values to Default
  deviceStatusInfo.value.name = device_name;
  deviceStatusInfo.value.state = 'Getting Status...';

  if (
    !devicelist_id ||
    isNaN(devicelist_id) ||
    !device_id ||
    !key_id ||
    isNaN(key_id) ||
    !device_name
  ) {
    return;
  }

  try {
    const response = await fetch(`/api/device-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ devicelist_id, device_id, key_id }),
    });

    if (response.ok) {
      const responseJson = await response.json();

      deviceStatusInfo.value.name = device_name;

      if (!responseJson[device_id]?.status) {
        // Tell user you cannot see status for this device
        deviceStatusInfo.value.state = 'Cannot Display Status';
        deviceStatusInfo.value.message = 'Cannot display status for this device.';

        showDeviceStatusModal.value = true;
        return;
      }

      deviceStatusInfo.value.state = 'Status Received';

      deviceStatusInfo.value.brightness = responseJson[device_id].status.brightness.value;
      deviceStatusInfo.value.color = responseJson[device_id].status.colorRgb.value;
      deviceStatusInfo.value.on =
        responseJson[device_id].status.powerSwitch.value || false;

      deviceStatusInfo.value.success = true;
      showDeviceStatusModal.value = true;
    } else {
      deviceStatusInfo.value.state = 'Failed to fetch status.';
    }
  } catch (e) {
    console.log(e);
  }
};

const hideDeviceStatusModal = () => {
  showDeviceStatusModal.value = false;
  deviceStatusInfo.value = deviceStatusDefaults();
};

/*
  Toggle Device
  -------------
  Requests on/off status from backend
 */
const toggleDevice = async () => {
  modalInfo.value.status = 'Sending request to Govee..';
  const payload = {
    device_id: modalInfo.value.device_id,
    sku: modalInfo.value.sku,
    db: modalInfo.value.db,
    key_id: props.id,
  };

  try {
    const response = await fetch(`/api/toggle-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response && response.ok) {
      modalInfo.value.status = 'Success!';

      setTimeout(() => {
        showModal.value = false;
      }, 1000);

      return;
    }

    modalInfo.value.status = 'Operation Failed.';

    setTimeout(() => {
      showModal.value = false;
    }, 1000);
  } catch (e) {
    console.log(e);
  }
};

const returnHome = () => {
  router.push('/');
};

// Mount Methods
onMounted(() => {
  loadDevices();
});
</script>

<template>
  <teleport to="body">
    <!-- Delete Key Modal -->
    <Modal :show="showModal">
      <template #header>
        <div class="flex flex-row gap-1 items-center text-white">
          <h1 class="text-xl">
            {{
              modalInfo.db
                ? 'Turn ' + modalInfo.device_name + ' On'
                : 'Turn ' + modalInfo.device_name + ' Off'
            }}
          </h1>
        </div>
      </template>
      <template #body>
        <div class="flex flex-col gap-1 mt-2 text-white/70 p-1">
          <p>
            Are you sure you want to turn <strong>{{ modalInfo.device_name }}</strong>
            {{ modalInfo.db ? 'on' : 'off' }}?
          </p>
          <button
            class="bg-green-500 rounded mt-2 font-bold hover:bg-green-600 hover:cursor-pointer h-9"
            @click="toggleDevice"
          >
            Yes
          </button>
          <button
            class="bg-sky-500/70 rounded font-bold hover:bg-sky-600/70 hover:cursor-pointer h-9"
            @click="showModal = false"
          >
            Cancel
          </button>
          <p class="text-center mt-1">{{ modalInfo.status }}</p>
        </div>
      </template>
    </Modal>
    <!-- Device Status Modal -->
    <Modal :show="showDeviceStatusModal">
      <template #header>
        <div class="flex flex-row gap-1 items-center text-white">
          <h1 class="text-xl">{{ deviceStatusInfo.name }} Status</h1>
        </div>
      </template>
      <template #body>
        <div class="flex flex-col gap-2 mt-2 text-white/70 p-1">
          <p>
            {{ deviceStatusInfo.message }}
          </p>
          <div v-if="deviceStatusInfo.success" class="flex flex-col gap-2">
            <p><strong>State:</strong> {{ deviceStatusInfo.on ? 'On' : 'Off' }}</p>
            <hr class="my-1" />
            <p><strong>Device Brightness:</strong> {{ deviceStatusInfo.brightness }}</p>
            <div class="flex flex-row gap-1 items-center justify-between">
              <p><strong>Current Color:</strong></p>
              <div class="w-30 h-4" :style="{ backgroundColor: cssColor }"></div>
            </div>
          </div>
          <button
            class="bg-sky-500/70 rounded font-bold hover:bg-sky-600/70 hover:cursor-pointer h-9 mt-2"
            @click="hideDeviceStatusModal"
          >
            Close
          </button>
        </div>
      </template>
    </Modal>
  </teleport>

  <h1 class="text-2xl text-white mt-2 ms-2 fade-in">Devices</h1>

  <div class="flex flex-col text-white fade-in p-2">
    <h2 class="text-white/70">Manage Your Govee Devices</h2>
    <button
      class="flex flex-row items-center text-lg border-1 border-sky-400 rounded p-1 mt-3 mb-3 transition-all duration-300 hover:bg-sky-400 hover:cursor-pointer"
      @click="returnHome"
    >
      <ArrowLeftIcon class="size-6 mx-5" />
      Return Home
    </button>

    <!--    Lights Section -->
    <div v-if="DevicesLoaded">
      <h2 class="text-2xl my-2">Lights</h2>
      <h2 class="text-white/70 mb-2">
        These are your Govee lights as of
        <strong>{{ new Date(Devices[0]?.last_updated).toLocaleString('en-US') }}</strong
        >.
      </h2>
      <div
        v-for="(v, k) in Devices[0].content"
        :key="k.toString().trim()"
        class="fade-in flex flex-col gap-3 hover:bg-gray-800"
      >
        <div class="flex flex-row border-b-1 border-sky-400 p-1 items-center">
          <LightBulbIcon class="size-6 me-3 text-sky-600"></LightBulbIcon>
          <h5 class="text-sky-400 text-lg">{{ v.deviceName }}</h5>
        </div>
        <div
          class="flex flex-col md:flex-row gap-3 items-center justify-center md:justify-between mb-3"
        >
          <div class="flex flex-col gap-2">
            <div class="flex flex-row gap-2">
              <button
                class="bg-green-400 w-30 rounded shadow hover:bg-green-600 hover:cursor-pointer"
                @click="showDeviceModal(true, v.deviceName, k, v.sku)"
              >
                On
              </button>
              <button
                class="bg-red-400 w-30 rounded shadow hover:bg-red-600 hover:cursor-pointer"
                @click="showDeviceModal(false, v.deviceName, k, v.sku)"
              >
                Off
              </button>
            </div>

            <!-- Light DeviceType Capabilities -->
            <div v-if="v.type === 'devices.types.light'" class="flex flex-row gap-2">
              <button
                class="bg-gray-700 w-30 rounded shadow hover:bg-gray-800 hover:cursor-pointer"
                @click="
                  fetchDeviceStatus(Devices[0].devicelist_id, k, props.id, v.deviceName)
                "
              >
                {{
                  deviceStatusInfo.name === v.deviceName
                    ? deviceStatusInfo.state
                    : 'Light Status'
                }}
              </button>
              <button
                class="bg-sky-400 w-30 rounded shadow hover:bg-sky-500 hover:cursor-pointer"
              >
                Change Color
              </button>
            </div>
          </div>

          <div class="flex flex-row gap-2 items-center hidden lg:flex">
            <p class="text-white/70">
              <strong>Type:</strong>
              {{ v.type ? v.type.toString().split('.')[2] : 'light' }}
            </p>
            <p class="text-white/70"><strong>Sku:</strong> {{ v.sku || 'unknown' }}</p>
            <p class="text-white/70"><strong>Mac:</strong> {{ k || 'unknown' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
