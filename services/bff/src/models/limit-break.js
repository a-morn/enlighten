const { produce } = require('immer');
const moment = require('moment');
const ws = require('../ws');

let limitBreaks = {};

const defaultLimitBreak = playerId => ({
  status: 'charging',
  internalLevel: 5,
  charge: 0,
  streak: 0,
  playerId
});

const chargeDecreasePerSecondByStatus = status => {
  switch (status) {
    case 'charging':
      return 0.1;
    case 'charged':
      return 10;
    case 'decharge':
      return 20;
  }
};

const getUpdatedLevel = lb => {
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

const getUpdatedStatus = (lb, now) => {
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

const getUpdatedLimitBreak = (baseLb, isAnswerCorrect, date) =>
  produce(baseLb, draftLb => {
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

const startLoop = () =>
  setInterval(() => {
    const wss = ws();
    wss.clients.forEach(wsClient => {
      const lb =
        limitBreaks[wsClient.playerId] || defaultLimitBreak(wsClient.playerId);
      const updatedLb = produce(lb, draftLb => {
        draftLb.charge = Math.max(
          0,
          draftLb.charge - chargeDecreasePerSecondByStatus(draftLb.status) / 2
        );
        draftLb.level = getUpdatedLevel(draftLb);
        draftLb.status = getUpdatedStatus(draftLb);
      });
      wsClient.send(
        JSON.stringify({ type: 'limit-break', payload: updatedLb })
      );
      limitBreaks[wsClient.playerId] = updatedLb;
    });
  }, 500);

const updateLimitBreakOnAnswer = (playerIdToUpdate, isAnswerCorrect, date) => {
  const wss = ws();
  console.log(wss.clients, playerIdToUpdate);
  const wsClient = Array.from(wss.clients).find(
    ({ playerId }) => playerId === playerIdToUpdate
  );

  const updatedLb = getUpdatedLimitBreak(
    limitBreaks[wsClient.playerId] || defaultLimitBreak(playerIdToUpdate),
    isAnswerCorrect,
    date
  );
  limitBreaks[wsClient.playerId] = updatedLb;
  wsClient.send(JSON.stringify({ type: 'limit-break', payload: updatedLb }));
};

module.exports = {
  startLoop,
  updateLimitBreakOnAnswer
};
