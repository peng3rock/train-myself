<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  min-height: -webkit-fill-available; /* iOS Safari 全屏支持 */
  position: relative;
}
</style>