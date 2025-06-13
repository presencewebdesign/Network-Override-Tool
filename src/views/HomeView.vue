<script setup>
import SimpleNetworkOverride from '../components/SimpleNetworkOverride.vue'
</script>

<template>
  <main class="home-main">
    helloß
    <SimpleNetworkOverride />
  </main>
</template>

<style lang="scss" scoped>
// Variables
$bg-gradient: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);

.home-main {
  min-height: 100vh;
  background: $bg-gradient;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }
}
</style>
