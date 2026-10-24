<script setup lang="ts">
import { useGameState } from '@/stores/gameState'
import Alarm from './icons/Alarm.vue';
import Warning from './icons/Warning.vue';
import Money from './icons/Money.vue';

const game = useGameState();
</script>

<template>
  <div class="wrapper">
    <div class="item" v-for="message in game.board" @click="game.solveMessage(message.adId)">
      <span><Money />{{ message.reward }}</span>
      <span><Alarm />{{ message.expiresIn }}</span>
      <span><Warning />{{ message.probability }}</span>
      <div>{{ message.message }}</div>
    </div>
  </div>
</template>

<style scoped>
  .wrapper {
    display: flex;
    flex-wrap: wrap;
  }

  .item {
    text-align: bottom;
    padding: 5px;
    margin: 0 5px 10px 0;
    cursor: pointer;
    border: 1px solid var(--success);
    border-radius: 5px;
    vertical-align: bottom;
    user-select: none;
  }
  @media (min-width: 520px) {
    .item {
      width: 300px;
    }
  }
</style>