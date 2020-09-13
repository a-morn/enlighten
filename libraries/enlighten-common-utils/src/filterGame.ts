import R from "ramda";
import {
  Game,
  GameMultiplayer,
  GameSingeplayer,
  isGameMultiplayer,
} from "enlighten-common-types";

function censorAnswerIfNotAnswered<T extends Game>(game: T): T {
  if (!R.pathEq(["currentQuestion", "answered"], true)(game)) {
    const censoredGame = {
      ...game,
      currentQuestion: game.currentQuestion
        ? R.pickBy((_, k) => k !== "answerIds", game.currentQuestion)
        : null,
    } as T;
    return censoredGame;
  } else {
    return game;
  }
}

function filterGame(game: GameSingeplayer | null): GameSingeplayer | null;
function filterGame(game: GameMultiplayer | null): GameMultiplayer | null;
function filterGame(game: GameSingeplayer): GameSingeplayer;
function filterGame(game: GameMultiplayer): GameMultiplayer;
function filterGame(
  game: GameSingeplayer | GameMultiplayer | null
): GameSingeplayer | GameMultiplayer | null {
  if (game === null) {
    return null;
  } else if (isGameMultiplayer(game)) {
    game.questions = [];
  }
  return censorAnswerIfNotAnswered(game);
}

export { filterGame };
