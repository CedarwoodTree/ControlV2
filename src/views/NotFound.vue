<script setup>
defineProps({
  error: String,
});
</script>

<template>
  <div class="d-flex flex-column text-white p-5">
    <h1>Not Found {{ error }}</h1>
  </div>
</template>

<style scoped></style>
