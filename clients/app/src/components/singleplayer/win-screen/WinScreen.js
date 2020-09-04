import React from 'react'
import Confetti from 'react-confetti'
import FullscreenModal from 'components/fullscreen-modal'

const width = window.innerWidth
const height = window.innerHeight

export function WinScreenSingleplayer({ close, category }) {
  return (
    <>
      <Confetti
        style={{ zIndex: 100, position: 'fixed' }}
        width={width}
        height={height}
        />
      <FullscreenModal
        data-testid="winner-modal"
        title={`You completed category ${category}!`}
        declineText="Ok"
        onDecline={close}
      />
    </>
  )
}
