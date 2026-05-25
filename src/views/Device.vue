<script setup>
// Imports
import { ArrowLeftIcon, LightBulbIcon, StarIcon } from '@heroicons/vue/24/solid';
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
const starredList = ref([]);
const showStarredToggleModal = ref(false);
const toggleStarredDevicesDB = ref(false);
const toggleStarredDeviceStatus = ref([]);
const disableStarredDeviceToggle = ref(false);

// Computed Methods

/*
  Sorted Devices
  --------------
  Returns array of devices beginning with those that are starred
 */
const sortedDevices = computed(() => {
  if (!DevicesLoaded.value || !Devices.value[0]) {
    return {};
  }

  if (!starredList.value || starredList.value.length < 1) {
    const filtered = Object.entries(Devices.value[0].content).filter(
      ([_, val]) => val.type
    );

    return Object.fromEntries(filtered);
  }

  let priority = {};
  let other = {};

  for (const [k, v] of Object.entries(Devices.value[0].content)) {
    if (!v.type) {
      continue;
    }
    if (starredList.value.includes(k)) {
      priority[k] = v;
    } else {
      other[k] = v;
    }
  }

  return {
    ...priority,
    ...other,
  };
});

/*
  Is Starred
  ----------
  Checks starred array to see if device_id is found
 */
const isStarred = (device_id) => {
  let rv = false;

  if (
    !starredList.value ||
    !Array.isArray(starredList.value) ||
    starredList.value.length < 1
  ) {
    return rv;
  }

  if (starredList.value.includes(device_id)) {
    rv = true;
  }

  return rv;
};

/*
  Load Starred List
  -----------------
 */
const loadStarred = async () => {
  if (!DevicesLoaded.value) {
    console.log('Failed to load starred. Devices must first be loaded.');
    return;
  }

  try {
    // Grab key_id from loaded key
    const key_id = Devices.value[0].key_id || null;

    if (!key_id || isNaN(key_id)) {
      return;
    }

    // Grab starred from server
    const response = await fetch('/api/starred/all/' + key_id);

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          if (typeof data[i] === 'object' && data[i].device_id) {
            starredList.value.push(data[i].device_id);
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
};

/*
  Star Device
  -----------
  Sends request to server to toggle star status of device
 */
const starDevice = async (device_id) => {
  if (!device_id) {
    return;
  }

  try {
    const db = isStarred(device_id);

    // If Already Starred (Delete)
    if (db) {
      const response = await fetch(`/api/starred/delete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: device_id,
        }),
      });

      if (response.ok) {
        // Remove device_id from starred array
        starredList.value = starredList.value.filter((id) => id !== device_id);
      }
      return;
    }

    // If Not Already Starred (Create)
    const response = await fetch(`/api/starred/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key_id: Number(props.id),
        device_id: device_id,
      }),
    });

    if (response.ok) {
      // Add device_id to starred array
      starredList.value.push(device_id);
    }
  } catch (e) {
    console.error(e);
  }
};

/*
  Toggle Starred Devices
  ----------------------
  Toggles the power state of all Starred devices
 */
const toggleStarredDevices = async () => {
  toggleStarredDeviceStatus.value = [];

  disableStarredDeviceToggle.value = true;
  toggleStarredDeviceStatus.value.push(
    `Turning ${toggleStarredDevicesDB.value ? 'on' : 'off'} starred devices..`
  );

  const detailedStarredDeviceList = {};

  // Grab all starred device data and put it in temporary array
  for (const [k, v] of Object.entries(Devices.value[0].content)) {
    if (k && starredList.value.includes(k)) {
      detailedStarredDeviceList[k] = v;
    }
  }

  // Loop through and toggle each device
  for (const [k, v] of Object.entries(detailedStarredDeviceList)) {
    toggleStarredDeviceStatus.value.push('Toggling ' + v.deviceName || 'unknown');
    const sku = v.sku || null;
    const device_id = k;
    const state = toggleStarredDevicesDB.value;
    const key_id = Devices.value[0].key_id || null;

    if (!sku || !device_id || !key_id) {
      toggleStarredDeviceStatus.value.push(
        'Failed to toggle ' + v.deviceName || 'unknown'
      );
      continue;
    }

    const response = await fetch(`/api/toggle-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_id: device_id,
        sku: sku,
        db: state,
        key_id: key_id,
      }),
    });

    if (response.ok) {
      toggleStarredDeviceStatus.value.push(
        'Successfully toggled ' + v.deviceName || 'unknown'
      );
    } else {
      toggleStarredDeviceStatus.value.push(
        'Failed to toggle ' + v.deviceName || 'unknown'
      );
    }
  }

  // Re-enable the modal button
  setTimeout(() => {
    showStarredToggleModal.value = false;
    disableStarredDeviceToggle.value = false;
    toggleStarredDeviceStatus.value = [];
  }, 1000);
};

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
        await loadStarred();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

/*
  Toggles Starred Devices Modal Visibility
 */
const displayToggleStarredModal = (state = false) => {
  toggleStarredDevicesDB.value = state ? true : false;
  showStarredToggleModal.value = !showStarredToggleModal.value;
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

    <!-- Starred Toggle Modal -->
    <Modal :show="showStarredToggleModal">
      <template #header>
        <div class="flex flex-row gap-1 items-center text-white">
          <h1 class="text-xl">
            Turn <strong>Starred</strong> devices
            {{ toggleStarredDevicesDB ? 'on' : 'off' }}?
          </h1>
        </div></template
      >

      <template #body>
        <div class="flex flex-col gap-2 mt-2 text-white p-1">
          <p v-if="toggleStarredDeviceStatus" v-for="status in toggleStarredDeviceStatus">
            {{ status }}
          </p>
          <button
            class="bg-green-400 rounded font-bold hover:bg-green-400/70 hover:cursor-pointer h-9 mt-2 w-full"
            @click="toggleStarredDevices"
            :disabled="disableStarredDeviceToggle"
          >
            Yes
          </button>
          <button
            class="bg-sky-500 rounded font-bold hover:bg-sky-600/70 hover:cursor-pointer h-8 mt-2 w-full"
            @click="displayToggleStarredModal(false)"
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
      <div v-if="starredList.length > 0">
        <h2 class="text-2xl my-2">Quick Toggle</h2>
        <h2 class="text-white/70 mb-2">
          Here you can group-toggle the power status of your
          <strong>starred</strong> devices. You currently have
          <strong>{{ starredList.length }}</strong> starred device(s).
        </h2>
      </div>

      <div class="flex flex-row gap-1 items-center" v-if="starredList.length > 0">
        <button
          class="w-1/2 bg-green-400 rounded border-1 border-sky-600 hover:cursor-pointer"
          @click="displayToggleStarredModal(true)"
        >
          On
        </button>
        <button
          class="w-1/2 bg-red-400 rounded border-1 border-sky-600 hover:cursor-pointer"
          @click="displayToggleStarredModal(false)"
        >
          Off
        </button>
      </div>
      <h2 class="text-2xl my-2">Lights</h2>
      <h2 class="text-white/70 mb-2">
        These are your Govee lights as of
        <strong>{{ new Date(Devices[0]?.last_updated).toLocaleString('en-US') }}</strong
        >.
      </h2>
      <div
        v-for="(v, k) in sortedDevices"
        :key="k.toString().trim()"
        class="fade-in flex flex-col gap-3 hover:bg-gray-800"
      >
        <div
          class="flex flex-row border-b-1 border-sky-400 p-1 items-center"
          :class="{ 'border-yellow-400': isStarred(k) }"
        >
          <StarIcon
            class="size-6 me-1 hover:cursor-pointer hover:border-1 rounded"
            @click="starDevice(k)"
            :class="{ 'text-yellow-400': isStarred(k), 'text-gray-400': !isStarred(k) }"
          ></StarIcon>
          <LightBulbIcon
            class="size-6 me-3 text-sky-600"
            :class="{ 'text-yellow-400': isStarred(k) }"
          ></LightBulbIcon>
          <h5 class="text-sky-400 text-lg" :class="{ 'text-yellow-400': isStarred(k) }">
            {{ v.deviceName }}
          </h5>
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
                class="bg-blue-400 w-30 rounded shadow hover:bg-blue-500 hover:cursor-pointer hidden"
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
