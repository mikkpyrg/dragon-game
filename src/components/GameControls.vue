<script setup lang="ts">
import { computed } from 'vue'
import { useGameState } from '@/stores/gameState'
import Progress from '../const/progress';
import Activities from '../const/activities';
import Trophy from './icons/Trophy.vue';
import User from './icons/User.vue';
import Heart from './icons/Heart.vue';
import Star from './icons/Star.vue';
import Money from './icons/Money.vue';
import SignalLevel from './icons/SignalLevel.vue';
import Refresh from './icons/Refresh.vue';
import Swords from './icons/Swords.vue';
import People from './icons/People.vue'
import Balance from './icons/Balance.vue';

const game = useGameState();
const activityMessage = computed(() => {
  switch (game.activity) {
    case Activities.SolveMessage:
      return 'Questing';
    case Activities.StartingGame:
      return 'Preparing game';
    case Activities.End:
      return 'Game over';
    case Activities.PreGame:
      return 'Waiting game start';
    case Activities.BuyItem:
      return 'Purchase';
    case Activities.InvestigateReputation:
      return 'Vanity check'
    default:
        console.log(`Unknown activity: ${game.activity}`)
        return '';
  }
});

const progressMessage = computed(() => {
  switch (game.progress) {
    case Progress.Pending:
      return 'in progress';
    case Progress.Succeeded:
      return 'achieved successfully';
    case Progress.Failed:
      return 'was a failure';
    default:
        console.log(`Unknown progress: ${game.progress}`)
        return '';
  }
});

const progressClass = computed(() => {
  switch (game.progress) {
    case Progress.Pending:
      return 'color-pending';
    case Progress.Succeeded:
      return 'color-success';
    case Progress.Failed:
      return 'color-failure';
    default:
        return '';
  }
});

const autoPlayText = computed(() => {
  return game.autoPlayInterval !== 0 ? 'Stop auto play' : 'Start auto play';
});
</script>

<template>
  <div>
    <button @click="game.startGame">Start a new game</button>
    <button @click="game.toggleAutoPlay" class="blue" v-if="game.activity !== Activities.PreGame && game.activity !== Activities.End">{{ autoPlayText }}</button>
    <button @click="game.loadReputation" class="yellow" v-if="game.activity !== Activities.PreGame && game.activity !== Activities.End">Load Reputation</button>
  </div>
  <div><Trophy />{{ game.highScoreGameId }}({{ game.highScore }})</div>
  <div v-if="game.activity !== Activities.PreGame">
     <div>
      <User />{{ game.gameId }}
      <Heart />{{ game.lives }}
      <Star />{{ game.score }}
      <Money />{{ game.gold }}
      <Refresh />{{ game.turn }}
      <SignalLevel />{{ game.level }}
      <People />{{ game.people }}
      <Balance />{{ game.state }}
      <Swords />{{ game.underworld }}
    </div>
    <span>{{ activityMessage }}</span>
    <span class="color" :class="progressClass">{{ progressMessage }}</span>
    <div>{{ game.result }}</div>
  </div>
</template>

<style scoped>
  .color {
    padding-left: 1rem;
  }
  .color-success {
    color: var(--success);
  }
  .color-failure {
    color: var(--failure);
  }
  .color-pending {
    color: var(--black);
  }
  button {
    margin:0 5px 1rem 0;
    padding: 5px 0;
    width: 150px;
    background-color: var(--start);
    border: none;
    border-radius: 3px;
    cursor: pointer;
    user-select: none;
  }
  .blue {
    background-color: var(--auto-play);
  }
  .yellow {
    background-color: var(--gold-yellow);
  }
</style>