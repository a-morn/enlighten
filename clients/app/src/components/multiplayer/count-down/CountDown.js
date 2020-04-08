import React, { useState, useEffect } from 'react'

import styles from './CountDown.module.scss'

export function CountDown({ duration }) {
  const [progress, setProgress] = useState(0)
  const [startTime] = useState(Date.now())
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    let queuedFrame
    const frame = () => {
      const now = Date.now() - startTime
      if (now < duration * 1000) {
        queuedFrame = requestAnimationFrame(frame)
      }
      setProgress(Math.min(1, now / (duration * 1000)))
    }
    frame()
    return () => cancelAnimationFrame(queuedFrame)
  }, [startTime, duration])

  useEffect(() => {
    let isSubscribed = true
    setTimeout(() => {
      if (isSubscribed) {
        setTimeLeft(state => Math.max(0, state - 1))
      }
    }, 1000)
    return () => (isSubscribed = false)
  }, [timeLeft])
  return (
    <div className={styles.countdown}>
      <div className={styles.countdown__background}></div>
      <div
        className={styles.countdown__progress}
        style={{ height: `${100 - progress * 100}%` }}
      ></div>
      <span
        className={`${styles.countdown__digit} ${
          progress === 1 ? ` ${[styles['countdown__digit--ended']]}` : ''
        }`}
      >
        {timeLeft}
      </span>
    </div>
  )
}
