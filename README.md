# 🤔 Enlighten - a multiplayer quiz app 🤔

This is a portfolio project by Albin Sebastian Mörner. The goal is to showcase proficiency in modern full stack web development. The project is live at [enlighten.rip](https://enlighten.rip). Work in progress, alpha, etc.

## 🤓 Tech stack 🤓

- React.js (CRA), Tailwind CSS, Apollo GraphQL, Cypress, Jest, React Testing Library
- Node.js, Typescript, Apollo GraphQL, Express.js, Redis, MongoDB
- Github (Github Actions)
- AWS (S3, CloudFront, Route 53, EC2, ELB, ElastiCache, CodeDeploy, Secrets Manager)
- MongoDB Atlas

### 🛣️ Infrastructure 🛣️

- **Client and static assets**
  - Static files: enlighten.rip, assets.enlighten.rip, artefacts.enligten.rip
  - AWS services: Route 53 -> CloudFront -> S3
  - Deployment: Deployed to S3 by Github Actions
- **Services**
  - Services: BFF (api.enlighten.rip), Worker
  - AWS services: Route 53 -> ELB -> EC2 -> ElastiCache (and MongoDB Atlas on EC2)
  - Deployment: Github Action puts build artefact on S3 and creats a Code Deploy deployment

## 👨🏽‍💻 Development 👨🏽‍💻

### 💻 Dependencies 💻

- node@14.1.0
- Redis
- MongoDB 4.2
- yarn

### 🏃‍♀️ Running the app 🏃‍♀️

- Start Redis on port 6379
- Start MongoDB, and set environment variables for bff (MONGO_DB_URL, MONGO_DB_USERNAME, MONGO_DB_PASSWORD)
- `cd services/bff && yarn && yarn build:dev && yarn run start:develop`
- `cd services/worker && yarn && yarn start:dev`
- `cd clients/app && yarn && yarn start`
- Direct you browser to localhost:8000

### 🐛 Debugging BFF 🐛

#### Multiple debuggable instances of BFF

Run the service with VS Code and the `Launch BFFs` configuration.

## 💻 Production 💻

### 🤐 Secrets 🤐

The workflows defined in `.github/workflows/*-production.yml` deploy to production. The workflows defined in `.github/workflows/*pr.yml` are ran on PR to master. There's currently no staging env. The following secrets are stored on Github and are used during CI: `AWS_ACCESS_KEY_ID`, `AWS_DEFAULT_REGION`, `AWS_PRODUCTION_BUCKET_NAME`, `AWS_SECRET_ACCESS_KEY`, `AWS_ASSETS_DISTRIBUTION_ID`, `AWS_APP_DISTRIBUTION_ID`. The following secrets are stored in AWS Secrets Manager and are used by services: `enlighten-mongodb-credentials`, `enlighten-github-oauth-credentials`, `enlighten-google-oauth-credentials`.

### 🖥️ EC2 🖥️

Runs the Ubuntu Server AMI. Needs CodeDeploy agent installed and running (https://docs.aws.amazon.com/codedeploy/latest/userguide/codedeploy-agent-operations-install-ubuntu.html).
