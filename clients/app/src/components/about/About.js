import React from 'react'

import bookcase from '../../assets/bookcase-edit-compressed.mp4'
import styles from './About.module.scss'

function About() {
  return (
    <div className={styles.about}>
      <div className={styles.about__textWrapper}>
        <h2 className={`pb-10 text-2xl text-gray-900`}>About</h2>
        <p className={`text-gray-900`}> ¯\_(ツ)_/¯</p>
      </div>
      <video
        className={styles.about__video}
        src={bookcase}
        autoPlay
        muted
      ></video>
    </div>
  )
}

export default About
