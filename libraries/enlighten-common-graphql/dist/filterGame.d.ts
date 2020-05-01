import { GameMultiplayer, GameSingeplayer } from "enlighten-common-types";
declare function filterGame(game: GameSingeplayer | null): GameSingeplayer | null;
declare function filterGame(game: GameMultiplayer | null): GameMultiplayer | null;
declare function filterGame(game: GameSingeplayer): GameSingeplayer;
declare function filterGame(game: GameMultiplayer): GameMultiplayer;
export { filterGame };
