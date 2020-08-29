export type Player = {
  id: string;
  name: string;
  profilePictureUrl?: string;
};

export type PlayerLobby = Player & {
  categoryId: string;
  timestamp: string;
};

export type PlayerMultiplayer = Player & {
  hasLeft: boolean;
  score: number;
  won: boolean;
  timestamp: string;
};

export type PlayerGameId = {
  gameId: string;
};

function isPlayer(x: unknown): x is Player {
  return (
    typeof (x as Player).id === "string" &&
    typeof (x as Player).name === "string"
  );
}

export function isPlayerMultiplayer(x: unknown): x is PlayerMultiplayer {
  return (
    isPlayer(x) &&
    typeof (x as PlayerMultiplayer).hasLeft === "boolean" &&
    typeof (x as PlayerMultiplayer).score === "number" &&
    typeof (x as PlayerMultiplayer).won === "boolean" &&
    typeof (x as PlayerMultiplayer).name === "string" &&
    typeof (x as PlayerMultiplayer).timestamp === "object"
  );
}

export function isPlayerGameId(x: unknown): x is PlayerGameId {
  return typeof (x as PlayerGameId).gameId === "string";
}

export function isPlayerLobby(x: unknown): x is PlayerLobby {
  return (
    isPlayer(x) &&
    typeof (x as PlayerLobby).categoryId === 'string' &&
    typeof (x as PlayerLobby).timestamp === "string"
  );
}
