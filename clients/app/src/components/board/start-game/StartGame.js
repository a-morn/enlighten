import React, { useContext, useState, useEffect, useCallback } from "react";
import CategoryPicker from "./category-picker";
import { SessionContext } from "hooks/context/session";

function Game({ className }) {
  const [{ category }, setSessionContext] = useContext(SessionContext);
  const [categories, setCategories] = useState([]);
	const [isStartingGame, setIsStartingGame] = useState();

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/categories`);
      const result = await response.json();
      setCategories(result);
    }
    fetchData();
  }, []);

	const startGameRequest = useCallback(async () => {
		if (!isStartingGame) {
			setIsStartingGame(true)
			const response = await fetch(`${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/games`, { method: 'POST', headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ category })})
			const { gameId } = await response.json()
			setSessionContext(context => ({ ...context, gameId }))
		}
	}, [isStartingGame, category])

	let buttonClasses = "bg-blue-500 text-white font-bold py-2 px-4 rounded"

	if (!category) {
		buttonClasses += " opacity-50 cursor-not-allowed"
	} else {
		buttonClasses += " hover:bg-blue-700"
	}
  return (
    <div className={`flex flex-col justify-center ${className}`}>
      <CategoryPicker
        onSelect={category =>
					setSessionContext(context => ({ ...context, category}))
        }
        categories={categories}
        selected={category}
      />
			<button
				disabled={!category || isStartingGame}
				onClick={startGameRequest}
				className={buttonClasses}
			>Start</button>
    </div>
  );
}

export default Game;
