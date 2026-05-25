<script setup>
import Menubar from '@/components/Menubar.vue';
import Footer from '@/components/Footer.vue';
import Banner from '@/components/Banner.vue';
import Sidebar from '@/components/Sidebar.vue';

import { BoltIcon, XMarkIcon, Bars3Icon, XCircleIcon } from '@heroicons/vue/16/solid';
import { onMounted, reactive, ref } from 'vue';
const loaded = ref(false);
const BannerOpen = ref(true);
const SidebarOpen = ref(false);

// Component Configs
const MenubarConfig = reactive({
  title: 'Control V2',
  pages: {
    home: '/',
    about: '/about',
    settings: '/settings',
    keys: '/keys',
  },
});

const FooterConfig = reactive({
  title: 'Control V2',
  description: 'A simple app for controlling Govee devices through the API.',
  links: {
    Home: '/',
    About: '/about',
    Settings: '/settings',
  },
});

const toggleSidebar = () => {
  SidebarOpen.value = !SidebarOpen.value;
};

onMounted(() => {
  loaded.value = true;
});
</script>

<template>
  <div v-if="loaded === false" id="loading-screen"></div>
  <div class="flex min-h-screen">
    <Sidebar :isOpen="SidebarOpen" :openMethod="toggleSidebar">
      <template #sidebar-close-icon
        ><XCircleIcon
          class="size-8 text-white ms-4 mt-4 hover:text-sky-200 transition-color duration-300 hover:cursor-pointer"
        ></XCircleIcon>
      </template>
    </Sidebar>

    <div class="flex-1 flex flex-col bg-gray-900 min-h-screen">
      <header>
        <Banner v-if="BannerOpen">
          <template #config>
            <p>Welcome to <strong>Control V2</strong>.</p>
            <XMarkIcon class="size-7 hover:text-sky-200" @click="BannerOpen = false" />
          </template>
        </Banner>
        <Menubar :config="MenubarConfig">
          <template #icon
            ><BoltIcon class="size-8 mr-2 text-sky-200 fade-in"></BoltIcon
          ></template>
          <template #sidebar-button>
            <Bars3Icon
              class="size-8 mr-2 text-white fade-in hover:text-sky-200 hover:cursor-pointer"
              @click="toggleSidebar"
            ></Bars3Icon>
          </template>
        </Menubar>
      </header>

      <main class="flex-grow container mx-auto px-4 py-8">
        <router-view> </router-view>
      </main>

      <Footer :config="FooterConfig"></Footer>
    </div>
  </div>
</template>

<style scoped>
#loading-screen {
  position: absolute;
  width: 100vw;
  height: 100vh;
  background-color: #101828;
}
</style>
