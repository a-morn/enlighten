/*import { produce } from 'immer';
import moment from 'moment';
import { listGames, getGame } from './singleplayer'

let limitBreaks: { [key: number]: Limitbreak } = {};

type Limitbreak = {
  internalLevel: number
  status: string;
  charge: number
  date: Date
  streak: number
  level: number
}

const defaultLimitBreak = (playerId: string) => ({
  status: 'charging',
  internalLevel: 5,
  charge: 0,
  streak: 0,
  playerId
});

const chargeDecreasePerSecondByStatus = (status: string) => {
  switch (status) {
    case 'charging':
      return 0.1;
    case 'charged':
      return 10;
    case 'decharge':
      return 20;
  }
};

const getUpdatedLevel = (lb: Limitbreak) => {
  switch (lb.status) {
    case 'charging':
      return lb.internalLevel;
    case 'charged':
    case 'decharge':
      return lb.internalLevel + lb.charge;
    default:
      return 0;
  }
};

const getUpdatedStatus = (lb: Limitbreak, now?: Date) => {
  switch (lb.status) {
    case 'charging':
      if (lb.streak > 5 && lb.charge > 5) {
        return 'charged';
      } else {
        return lb.status;
      }
    case 'charged':
      if (lb.streak === 0 && lb.charge < 5) {
        return 'charging';
      } else if (
        lb.streak === -1 ||
        lb.charge < 5 ||
        moment.duration(moment(now).diff(lb.date)).seconds() > 2
      ) {
        return 'decharge';
      } else {
        return lb.status;
      }
    case 'decharge':
      if (lb.charge <= 0) {
        return 'charging';
      } else {
        return lb.status;
      }
    default:
      return 'charging';
  }
};

const getUpdatedLimitBreak = (baseLb: Limitbreak, isAnswerCorrect: boolean, date: Date) =>
  produce((baseLb: Limitbreak, draftLb: Limitbreak) => {
    if (isAnswerCorrect) {
      draftLb.streak++;
      draftLb.charge++;
    } else {
      draftLb.streak = Math.min(draftLb.streak - 1, 0);
      draftLb.charge--;
    }

    draftLb.status = getUpdatedStatus(draftLb);

    draftLb.level = getUpdatedLevel(draftLb);

    if (isAnswerCorrect) {
      if (draftLb.status === 'charged') {
        draftLb.charge += 25;
      }
    } else {
      if (draftLb.status === 'charged') {
        draftLb.charge -= 30;
      }
    }
    draftLb.date = date;
  });

const limitBreakLoop = () =>
  setInterval(() => {
    Object.values(listGames())
      .forEach(({ player: { wsClient, playerId } }) => {
        const lb = limitBreaks[playerId] || defaultLimitBreak(playerId);
        const updatedLb = produce(lb, draftLb => {
          draftLb.charge = Math.max(
            0,
            draftLb.charge - chargeDecreasePerSecondByStatus(draftLb.status) / 2
          );
          draftLb.level = getUpdatedLevel(draftLb);
          draftLb.status = getUpdatedStatus(draftLb);
        });
        wsClient.send(
          JSON.stringify({
            resource: 'limit-break',
            method: 'PUT',
            payload: updatedLb
          })
        );
        limitBreaks[playerId] = updatedLb;
      });
  }, 500);

const updateLimitBreakOnAnswer = (gameId, isAnswerCorrect, date) => {
  const {
    player: { wsClient, playerId }
  } = getGame(gameId);

  const updatedLb = getUpdatedLimitBreak(
    limitBreaks[playerId] || defaultLimitBreak(playerId),
    isAnswerCorrect,
    date
  );
  limitBreaks[playerId] = updatedLb;
  wsClient.send(JSON.stringify({ type: 'limit-break', payload: updatedLb }));
};

export {
  limitBreakLoop,
  updateLimitBreakOnAnswer
};
*/