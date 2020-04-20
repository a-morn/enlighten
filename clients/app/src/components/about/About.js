import React from 'react'

import bookcase from '../../assets/bookcase-edit-compressed.mp4'
import styles from './About.module.scss'

function About() {
  return (
    <div className={`${styles.about}`}>
      <div className={`${styles.about__textWrapper} rounded p-4`}>
        <h2 className={`pb-10 text-2xl text-brand`}>About</h2>
        <p className={`text-brand`}>
          Portfolio project for Albin Sebastian Mörner. Need a full stack web
          developer? Contact albin[dot]morner[at]gmail[dot]com. Corona pandemic
          special sale!
        </p>
        <p className={`text-brand mt-8`}>
          Built with: React (CRA), Tailwind CSS, Node.js, Express.js, Apollo
          GraphQL, TypeScript, Redis, AWS (S3, CloudFront, EC2, ElastiCache,
          CodeDeploy), GitHub Actions
        </p>
      </div>
      <video
        className={styles.about__video}
        src={bookcase}
        autoPlay
        muted
        controlsList="nofullscreen"
        playsinline
      ></video>
    </div>
  )
}

export default About
