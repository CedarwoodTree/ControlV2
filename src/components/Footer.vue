<script setup>
const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <footer class="bg-gray-900 text-white py-8 mt-auto">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 class="text-white text-lg font-bold mb-4">{{ props.config.title }}</h3>
          <p class="text-sm">
            {{ props.config.description }}
          </p>
        </div>

        <!-- Column 2: Links -->
        <div>
          <h4 class="text-white font-semibold mb-4">Quick Links</h4>
          <ul class="flex flex-row space-x-2 text-sm">
            <li v-for="(v, k) in props.config.links">
              <router-link
                :to="v"
                :key="k"
                class="hover:text-sky-500 transition duration-500 ease-in-out"
                >{{ k }}</router-link
              >
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
        <p>&copy; Control V2. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped></style>
