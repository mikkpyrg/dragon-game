import axios from 'axios';
import Activities from '../const/activities';
import { useGameState } from '@/stores/gameState'

const api = axios.create({ baseURL: import.meta.env.VITE_URL });

function criticalFailure()
{
  const game = useGameState();
  game.criticalFailure();
}

export default {
  startGame() {
    return api.post('game/start')
    .catch(criticalFailure);
  },
  loadShop(gameId: string) {
    return api.get(`${gameId}/shop`)
    .catch(criticalFailure);
  },
  loadMessages(gameId: string) {
    return api.get(`${gameId}/messages`)
    .catch(criticalFailure);
  },
  loadReputation(gameId: string) {
    return api.post(`${gameId}/investigate/reputation`)
    .catch(criticalFailure);
  },
  solveMessage(gameId: string, messageId: string) {
    return api.post(`${gameId}/solve/${messageId}`)
    .catch(criticalFailure);
  },
  buyItem(gameId: string, itemId: string) {
    return api.post(`${gameId}/shop/buy/${itemId}`)
    .catch(criticalFailure);
  }
}