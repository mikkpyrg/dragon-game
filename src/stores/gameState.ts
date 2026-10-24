import { defineStore } from 'pinia'
import Progress from '../const/progress';
import Activities from '../const/activities';
import api from '../apis/api';

const HighScoreLocalStorageKey = 'highScore';

interface BoardItem {
  adId: string,
  message: string,
  reward: number,
  expiresIn: number,
  probability: string,
  encrypted?: number
}

interface ShopItem {
  id: string,
  name: string,
  cost: number,
}

const priorityRank: any = {
  'Piece of cake': 0,
  'Walk in the park': 1,
  'Sure thing': 2,
  'Quite likely': 3,
  'Gamble': 4,
  'Hmmm...': 5,
  'Risky': 6,
  'Playing with fire': 7,
  'Rather detrimental': 8,
  'Suicide mission': 9,
  'Impossible': 10,
}

function handleRot13(text: string) {
  var msg = '';
  for(var i = 0; i < text.length; i++) {
    var code = text.charCodeAt(i);
    if (code >= 48 && code <= 57) {
      code = ((code - 48 + 13) % 10) + 48;
      msg += String.fromCharCode(code);
    } else if (code >= 65 && code <= 90) {
      code = ((code - 65 + 13) % 26) + 65;
      msg += String.fromCharCode(code);
    } else if (code >= 97 && code <= 122) {
      code = ((code - 97 + 13) % 26) + 97;
      msg += String.fromCharCode(code);
    } else {
      msg += ' ';
    }
  }
 return msg;
}

export const useGameState = defineStore('gameState', {
  state: () => {
    var highScore = 0;
    var highScoreGameId = '';
    var storedHighScoreJson = localStorage.getItem(HighScoreLocalStorageKey);
    if (storedHighScoreJson) {
      const json = JSON.parse(storedHighScoreJson);
      highScore = json.highScore;
      highScoreGameId = json.highScoreGameId;
    }

    return { 
        activity: Activities.PreGame,
        progress: Progress.Succeeded,
        result: '',
        gameId: '',
        lives: 0,
        gold: 0,
        level: 0,
        score: 0,
        turn: 0,
        state: 0,
        people: 0,
        underworld: 0,
        highScore: highScore,
        highScoreGameId: highScoreGameId,
        board: [] as BoardItem[],
        shop: [] as ShopItem[],
        autoPlayInterval: 0
    }
  },
  actions: {
    startActivity(activity: Activities) {
      this.progress = Progress.Pending;
      this.activity = activity;
    },
    endActivity(success: boolean, result: string) {
      this.progress = success ? Progress.Succeeded : Progress.Failed;
      this.result = result;
    },
    criticalFailure() {
      this.progress = Progress.Failed;
      this.result = "API error";
    },
    async startGame() {
      if (this.progress === Progress.Pending) return;

      this.startActivity(Activities.StartingGame);
      const startGameRequest = await api.startGame();
      if (!startGameRequest?.data) return;
      const data = startGameRequest.data;
      console.log("wowawerz", data);
      this.lives = data.lives;
      this.gold = data.gold;
      this.level = data.level;
      this.score = data.score;
      this.turn = data.turn;
      this.gameId = data.gameId;

      var loadShopSuccess = await this.loadShop();
      if (!loadShopSuccess) return;
      await this.loadMessages();

      this.endActivity(true, 'Game is ready to be played');
    },
    async loadShop() {
      const request = await api.loadShop(this.gameId);
      if (!request?.data) return false;
      const data = request.data;
      this.shop = data;
      return true;
    },
    async loadReputation() {
      this.startActivity(Activities.InvestigateReputation);
      const request = await api.loadReputation(this.gameId);
      if (!request?.data) return false;
      const data = request.data;
      this.people = data.people.toFixed(1);
      this.state = data.state.toFixed(1);
      this.underworld = data.underworld.toFixed(1);
      
      const loadMessagesSuccessful = await this.loadMessages();
      if (!loadMessagesSuccessful) return;

      this.endActivity(true, 'Reputation found!');
    },
    async loadMessages() {
      const request = await api.loadMessages(this.gameId);
      if (!request?.data) return false;
      const data = request.data;
      this.board = data.map((x: BoardItem) => {
        if (!x.encrypted) return x;

        if (x.encrypted === 1) {
          x.adId = atob(x.adId);
          x.message = atob(x.message);
          x.probability = atob(x.probability);
        } else if (x.encrypted === 2) {
          x.adId = handleRot13(x.adId);
          x.message = handleRot13(x.message);
          x.probability = handleRot13(x.probability);
        } else if (x.encrypted > 2) {
          console.warn('New encryption: ' + x.encrypted + ' message example: ' + x.message + ', adId: ' + x.adId);
        }
        return x;
      });
      return true;
    },
    async solveMessage(messageId: string) {
      if (this.progress === Progress.Pending || this.activity === Activities.End || this.activity === Activities.PreGame) return;

      this.startActivity(Activities.SolveMessage);
      const request = await api.solveMessage(this.gameId, messageId);
      if (!request?.data) return false;
      const data = request.data;
      this.lives = data.lives;
      this.gold = data.gold;
      this.score = data.score;
      this.turn = data.turn;

      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.highScoreGameId = this.gameId;

        localStorage.setItem(HighScoreLocalStorageKey, JSON.stringify({
          highScore: this.highScore,
          highScoreGameId: this.highScoreGameId
        }))
      }

      if (this.lives <= 0) {
        this.progress = Progress.Succeeded;
        this.activity = Activities.End;
        this.result = data.message;
      } else {
        await this.loadMessages();
        this.endActivity(data.success, data.message);
      }
      
      return true;
    },
    async buyItem(itemId: string) {
      if (this.progress === Progress.Pending || this.activity === Activities.End || this.activity === Activities.PreGame) return;

      this.startActivity(Activities.BuyItem);
      const request = await api.buyItem(this.gameId, itemId);
      if (!request?.data) return false;
      const data = request.data;
      this.gold = data.gold;
      this.level = data.level;
      this.lives = data.lives;
      this.turn = data.turn;
      await this.loadMessages();
      this.endActivity(data.shoppingSuccess, data.shoppingSuccess ? 'Item bought' : 'Item too expensive');
      return true;
    },
    toggleAutoPlay() {
      if (this.autoPlayInterval) this.endAutoPlay();
      else this.autoPlayInterval = setInterval(this.autoPlaySingleTurn, 1000);
    },
    endAutoPlay() {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = 0;
    },
    async autoPlaySingleTurn() {
      if (this.progress === Progress.Pending) return;
      if (this.activity === Activities.End || this.activity === Activities.PreGame) this.endAutoPlay();

      if (this.lives < 3 && this.gold >= 50) this.buyItem('hpot');
      else if (this.gold >= 150) this.buyItem('cs');
      else {
        var copy = [...this.board];
        copy.sort(
        (a, b) => (priorityRank[a.probability] ?? Infinity) -
                  (priorityRank[b.probability] ?? Infinity));

        this.solveMessage(copy[0]?.adId ?? '');
      }
    },
  },
})
