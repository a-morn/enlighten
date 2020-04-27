import React, { useEffect, useState } from 'react'
import styles from './Scoreboard.module.scss'
import { usePrevious } from '../../../../../hooks/use-previous'

export function Scoreboard({ name, score }) {
  const [playerScored, setPlayerScored] = useState()
  const previousScore = usePrevious(score)
  useEffect(() => {
    if (score > previousScore) {
      setPlayerScored(true)
      setTimeout(() => setPlayerScored(false), 500)
    }
  }, [score, previousScore])
  return (
    <div className="flex items-center text-brand-dark justify-between">
      <span
        className={`font-bold mr-4 ${styles['scoreboard__name']}`}
      >{`${name}:`}</span>
      <div
        className={`rounded ${styles['scoreboard__score-wrapper']} ${
          playerScored ? styles['scoreboard__score-wrapper--scored'] : ''
        }`}
      >
        <span
          className={`text-center ${styles['scoreboard__score-wrapper__score']}`}
          style={{
            top: `${(-2 * ((score - (score % 10)) % 100)) / 10 || 0}em`,
            hidden: score < 10,
          }}
        >
          0 1 2 3 4 5 6 7 8 9
        </span>
        <span
          className={`text-center ${styles['scoreboard__score-wrapper__score']}`}
          style={{ top: `${-2 * (score % 10) || 0}em` }}
        >
          0 1 2 3 4 5 6 7 8 9
        </span>
      </div>
    </div>
  )
}
