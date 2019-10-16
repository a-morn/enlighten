import React, { useContext, useState, useEffect, useRef } from "react";
import { SessionContext } from "hooks/context/session";
import LimitBreak from './limit-break'
import Question from './question'

const playerId = Math.random();
const socket = new WebSocket(`ws://${process.env.REACT_APP_BFF_URL}/ws?playerId=${playerId}`);

function Game() {
  const [{ gameId }, setSessionContext] = useContext(SessionContext);
  const [question, setQuestion] = useState();
  const [selectedAlternativeId, setSelectedAlternativeId] = useState();
  const [correctAlternativeId, setCorrectAlternativeId] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [limitBreakLevel, setLimitBreakLevel] = useState(0);
  const [limitBreakTimerActive, setLimitBreakTimerActive] = useState(false);
  const [limitBreakStatus, setLimitBreakStatus] = useState("inactive");
  const [limitBreakCharge, setLimitBreakCharge] = useState(0);
  const [
    limitBreakHasAchievedGodlike,
    setLimitBreakHasAchievedGodlike
  ] = useState(false);
  const [
    limitBreakHasAchievedDominating,
    setLimitBreakHasAchievedDominating
  ] = useState(false);
  const [
    limitBreakHasAchievedRampage,
    setLimitBreakHasAchievedRampage
  ] = useState(false);

  socket.onmessage = event => {
    const { type, payload } = JSON.parse(event.data);
    switch (type) {
      case "limit-break":
        const { level, status, charge } = payload;
        setLimitBreakLevel(level);
        setLimitBreakStatus(status);
        setLimitBreakCharge(charge);
        if (status !== "charged") {
          setLimitBreakHasAchievedGodlike(false);
          setLimitBreakHasAchievedDominating(false);
          setLimitBreakHasAchievedRampage(false);
        }
        break;
      default:
        throw Error(`Unsuported type: ${type}`);
    }
  };

	useEffect(() => {
      return () => {
				socket.close();
      }
   }, []);

  useEffect(() => {
		let isSubscribed = true
    async function fetchData() {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/games/${gameId}/questions/next`
      );
      const result = await response.json();
			if (isSubscribed) {
				setCorrectAlternativeId(null);
				setSelectedAlternativeId(null);
				setQuestion(result);
				setIsLoading(false);
				setLimitBreakTimerActive(true);
			}
    }
    if (
      (correctAlternativeId !== null)
    ) {
      setTimeout(fetchData, 300);
    }
		return () => (isSubscribed = false)
  }, [correctAlternativeId, gameId]);

  useEffect(() => {
		let isSubscribed = true
    async function postAlternative(alt) {
      setLimitBreakTimerActive(false);
      setIsLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/games/${gameId}/questions/${question.id}/answer?playerId=${playerId}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            answer: selectedAlternativeId
          })
        }
      );
      const { correctAnswer, levelUp } = await response.json();
      if (levelUp) {
        alert("ding!");
      }

			if (isSubscribed) {
				setCorrectAlternativeId(correctAnswer);
			}
    }
    if (typeof selectedAlternativeId === "number") {
      postAlternative(selectedAlternativeId);
    }

		return () => isSubscribed = false
  }, [selectedAlternativeId, question]);

  useEffect(() => {
    if (limitBreakStatus === "charged") {
      if (limitBreakLevel > 50 && !limitBreakHasAchievedGodlike) {
        setLimitBreakHasAchievedGodlike(true);
        const audio = new Audio("godlike.mp3");
        audio.volume = 0.005;
        audio.play();
      } else if (limitBreakLevel > 75 && !limitBreakHasAchievedDominating) {
        setLimitBreakHasAchievedDominating(true);
        const audio = new Audio("dominating.mp3");
        audio.volume = 0.0075;
        audio.play();
      } else if (limitBreakLevel >= 100 && !limitBreakHasAchievedRampage) {
        setLimitBreakHasAchievedRampage(true);
        const audio = new Audio("rampage.mp3");
        audio.volume = 0.01;
        audio.play();
      }
    }
  }, [limitBreakLevel, limitBreakHasAchievedGodlike, limitBreakHasAchievedDominating, limitBreakHasAchievedRampage, limitBreakStatus]);

  useEffect(() => {
    let interval = null;
    if (limitBreakTimerActive && false) {
      interval = setInterval(() => {
        setLimitBreakLevel(Math.max(limitBreakLevel - 1, 0));
      }, 250);
    }
    return () => clearInterval(interval);
  }, [limitBreakTimerActive, limitBreakLevel]);

  const alternativeSelected = altId => {
    setSelectedAlternativeId(altId);
  };

	const endGame = async () => {
      await fetch(
        `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/games/${gameId}`,
        {
          method: "DELETE",
        }
      );
			setSessionContext(context => ({ ...context, gameId: null}))	
	}

  return (
    <div>
      <LimitBreak
        level={limitBreakLevel}
        charge={limitBreakCharge}
        status={limitBreakStatus}
        max={100}
      />
      {question && (
        <Question
					className="pt-4"
          disabled={isLoading || limitBreakStatus === "decharge"}
          question={question}
          selectedAlternativeId={selectedAlternativeId}
          correctAlternativeId={correctAlternativeId}
          onAlternativeSelected={alternativeSelected}
        />
      )}
			<button className="bg-red-500 text-white rounded px-4 mt-10" onClick={endGame}>End game</button>
    </div>
  );
}

export default Game;
