import React from 'react'

import bookcase from '../../assets/bookcase-edit-compressed.mp4'
import styles from './About.module.scss'

function About() {
  return (
    <div className={styles.about}>
      <div className={styles.about__textWrapper}>
        <h2 className={`pb-10 text-2xl text-brand`}>About</h2>
        <p className={`text-brand`}>
          Portfolio project for Albin Sebastian Mörner. Need a web developer?
          Contact albin[at]gmail[dot]com. Corona pandemic special sale!
        </p>
        <p className={`text-brand mt-8`}>
          Built with: React, CRA, Tailwind CSS, Node.js, express, Apollo GraphQL
        </p>
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
