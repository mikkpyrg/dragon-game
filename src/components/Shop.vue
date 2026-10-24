<script setup lang="ts">
import { useGameState } from '@/stores/gameState'

const game = useGameState();
</script>

<template>
  <div>
    <button v-for="shopItem in game.shop" class="item" @click="game.buyItem(shopItem.id)">{{ shopItem.name }}({{ shopItem.cost }})</button>
  </div>
</template>

<style scoped>
  .item {
    margin-bottom: 1rem;
    padding: 5px 0;
    width: 150px;
    background-color: var(--money);
    border: none;
    border-radius: 3px;
    cursor: pointer;
    user-select: none;
  }
</style>