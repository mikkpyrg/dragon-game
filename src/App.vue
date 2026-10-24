<script setup lang="ts">
import GameControls from './components/GameControls.vue'
import Adventure from './components/Adventure.vue'
import Shop from './components/Shop.vue'
</script>

<template>
  <GameControls />
  <div class="grouped">
    <Adventure />
    <Shop />
  </div>
</template>

<style scoped>
  .grouped {
    display: flex;
    place-items: top;
    div:nth-child(2) {
      width: 150px;
    }
  }
</style>
