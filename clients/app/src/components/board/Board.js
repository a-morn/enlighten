import React, { useContext } from "react";
import { SessionContext } from "hooks/context/session";
import StartGame from './start-game'
import Game from './game'

function Board() {
  const [{ category }] = useContext(SessionContext);
  const [{ gameId }] = useContext(SessionContext);

  return (
    <div className="flex flex-col items-center">
			{ !gameId && <StartGame className="p-10"/> }
			{ gameId && <Game /> }
    </div>
  );
}

export default Board;
