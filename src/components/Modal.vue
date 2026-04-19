<script setup>
const props = defineProps({
  show: Boolean,
});
</script>

<template>
  <div class="modal-backdrop flex flex-col" v-if="show">
    <div class="modal-container bg-gray-900 p-5 rounded">
      <div class="modal-header">
        <slot name="header"></slot>
      </div>
      <div class="modal-body">
        <slot name="body"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.5);
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.modal-container {
  margin: auto;
  width: 300px;
}
</style>
