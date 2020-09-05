import FullscreenModal from 'components/fullscreen-modal'
import React from 'react'
import Confetti from 'react-confetti'
import styles from './WinScreen.module.scss'

const width = window.innerWidth
const height = window.innerHeight

export function WinScreen({ playerWon, winnerName, leaveGame }) {
  return (
    <>
      {playerWon && (
        <Confetti
          style={{ zIndex: 100, position: 'fixed' }}
          width={width}
          height={height}
        />
      )}
      {!playerWon && (
        <div className={styles['win-screen__poop-rain']}>
          <span
            role="img"
            aria-label="poop"
            style={{
              fontSize: '32px',
              left: '10vw',
              animationDelay: '2s',
              animationDuration: '8s',
            }}
          >
            💩
          </span>
          <span
            role="img"
            aria-label="poop"
            style={{
              fontSize: '64px',
              left: '22vw',
              animationDelay: '1s',
              animationDuration: '6s',
            }}
          >
            💩
          </span>
          <span
            role="img"
            aria-label="poop"
            style={{
              fontSize: '24px',
              left: '43vw',
              animationDelay: '5s',
              animationDuration: '4s',
            }}
          >
            💩
          </span>
          <span
            role="img"
            aria-label="poop"
            style={{
              fontSize: '32px',
              left: '64vw',
              animationDelay: '2s',
              animationDuration: '5s',
            }}
          >
            💩
          </span>
          <span
            role="img"
            aria-label="poop"
            style={{
              fontSize: '54px',
              left: '80vw',
              animationDelay: '3s',
              animationDuration: '6s',
            }}
          >
            💩
          </span>
        </div>
      )}
      <FullscreenModal
        data-testid="winner-modal"
        title={`${playerWon ? 'You' : winnerName} won! ${
          playerWon ? '😃' : '😢'
        }`}
        declineText="Ok"
        onDecline={leaveGame}
      />
    </>
  )
}
