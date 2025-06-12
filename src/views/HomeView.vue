<script setup>
import SimpleNetworkOverride from '../components/SimpleNetworkOverride.vue'
</script>

<template>
  <main class="home-main">
    <SimpleNetworkOverride />
  </main>
</template>

<style scoped>
.home-main {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .home-main {
    padding: 16px;
  }
}
</style>
