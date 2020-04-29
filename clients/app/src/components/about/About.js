import React from 'react'

function About() {
  return (
    <article
      className={`rounded p-4 bg-white`}
      style={{ height: 'fit-content' }}
    >
      <h2 className={`pb-10 text-2xl text-brand`}>About</h2>
      <p className={`text-brand`}>
        Portfolio project for Albin Sebastian Mörner. Need a full stack web
        developer? Contact albin[dot]morner[at]gmail[dot]com. Corona pandemic
        special sale!
      </p>
      <p className={`text-brand mt-8`}>
        Built with: React (CRA), Cypress, Jest, React Testing Library, Tailwind
        CSS, SCSS, Node.js, Express.js, Apollo GraphQL, TypeScript, Redis,
        MongoDB (MongoDB Atlas), AWS (S3, CloudFront, EC2, ElastiCache,
        CodeDeploy), GitHub (GitHub Actions).
      </p>
    </article>
  )
}

export default About
