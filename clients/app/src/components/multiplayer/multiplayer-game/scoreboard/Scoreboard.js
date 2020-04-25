import React from 'react'

import styles from './Scoreboard.module.scss'

export function Scoreboard({ players }) {
  return (
    <div
      className={`flex justify-between text-lg bg-gray-lighter p-4 rounded flex-col sm:flex-row`}
    >
      {players.map(({ name, score, id }) => (
        <div
          key={id}
          className="flex items-center text-brand-dark justify-between"
        >
          <span
            className={`font-bold mr-4 ${styles['scoreboard__name']}`}
          >{`${name}:`}</span>
          <div className={styles['scoreboard__score-wrapper']}>
            <span
              className={`${styles['scoreboard__score-wrapper__score']}`}
              style={{
                top: `${(-2 * ((score - (score % 10)) % 100)) / 10 || 0}em`,
                hidden: score < 10,
              }}
            >
              0 1 2 3 4 5 6 7 8 9
            </span>
            <span
              className={`${styles['scoreboard__score-wrapper__score']}`}
              style={{ top: `${-2 * (score % 10) || 0}em` }}
            >
              0 1 2 3 4 5 6 7 8 9
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
