<script>
export default {
  data() {
    return {
      current: '/',
    };
  },

  props: {
    config: {
      type: Object,
      required: true,
    },
  },

  methods: {
    openPage(page) {
      window.localStorage.setItem('currentPage', page);
      this.current = page;
      this.$router.push(`${page}`);
    },
  },

  watch: {
    $route(to, from) {
      this.current = to.path;
    },
  },

  mounted() {
    console.log('Menubar Mounted');
    this.current = localStorage.getItem('currentPage') || '/';
  },
};
</script>

<template>
  <div
    id="menubar"
    class="flex flex-col md:flex-row border-b-2 border-sky-200 text-white shadow-lg justify-between p-6"
  >
    <div class="flex flex-row items-center">
      <slot name="icon"></slot>
      <button
        class="font-bold text-3xl fade-in cursor-pointer hover:text-sky-200"
        @click="openPage('/')"
      >
        {{ config.title || 'Placeholder' }}
      </button>
    </div>
    <div class="flex flex-row text-lg gap-4 mt-2 md:mt-0 fade-in items-center">
      <button
        v-for="(v, k) in config.pages"
        :key="v"
        @click="openPage(v)"
        :class="{
          'text-gray-400': v === current,
          'hover:underline hover:cursor-pointer': v !== current,
        }"
      >
        {{ k.toString().toUpperCase() }}
      </button>
      <slot name="sidebar-button"></slot>
    </div>
  </div>
</template>

<style scoped>
#menubar {
  min-width: 100vw;
  & button {
    transition: color;
    transition-duration: 0.7s;
  }
}
</style>
