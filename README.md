# 🤔 Enlighten - a multiplayer quiz app

This is a portfolio project by Albin Sebastian Mörner. The goal is to showcase proficiency in modern full stack web development. The project is live at [enlighten.rip](https://enlighten.rip). Work in progress, alpha, etc.

## 🤓 Tech stack

- React.js (CRA), Tailwind CSS, Apollo GraphQL, Cypress, Jest, React Testing Library
- Node.js, Typescript, Apollo GraphQL, Express.js, Redis, MongoDB
- Github (Github Actions)
- AWS (S3, CloudFront, Route 53, EC2, ELB, ElastiCache, CodeDeploy, Secrets Manager)
- MongoDB Atlas

### 🛣️ Infrastructure

- **Client and static assets**
  - Static files: enlighten.rip, assets.enlighten.rip, artefacts.enligten.rip
  - AWS services: Route 53 -> CloudFront -> S3
  - Deployment: Deployed to S3 by Github Actions
- **Services**
  - Services: BFF (api.enlighten.rip), Worker
  - AWS services: Route 53 -> ELB -> EC2 -> ElastiCache (and MongoDB Atlas on EC2)
  - Deployment: Github Action puts build artefact on S3 and creats a Code Deploy deployment

## 👨🏽‍💻 Development

### 💻 Dependencies

- node@14.1.0
- Redis
- MongoDB 4.2
- yarn

### 🏃‍♀️ Running the app

- Start Redis on port 6379 (docker: `docker run -p 6379:6379 -d redis`)
- Start MongoDB (docker: `docker run -d -p 27017:27017 -v ~/data:/data/db mongo`)
  - Set environment variable MONGO_DB_CONNECTION_STRING for bff (`.env.developement`) and for `data/questions` (`.env`)
  - Run `yarn reload-questions` in `data/questions`
- Start services and client
  - `cd services/bff && yarn && yarn build:dev && yarn start:dev`
  - `cd services/worker && yarn && yarn start:dev`
  - `cd clients/app && yarn && yarn start`
- Direct you browser to localhost:8000

### 🐛 Debugging BFF

#### Multiple debuggable instances of BFF

Run the service with VS Code and the `Launch BFFs` configuration.

### Updating `libraries/*`

1. Bump version in `package.json` according to semver
2. `npm login`
3. `npm publish`
4. Bump version in consuming projects

Should be using private NPM repository...

### Running Cypress on WSL2

https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress

## 💻 Production

### 🤐 Secrets

The workflows defined in `.github/workflows/*-production.yml` deploy to production. The workflows defined in `.github/workflows/*pr.yml` are ran on PR to master. There's currently no staging env. The following secrets are stored on Github and are used during CI: `AWS_ACCESS_KEY_ID`, `AWS_DEFAULT_REGION`, `AWS_PRODUCTION_BUCKET_NAME`, `AWS_SECRET_ACCESS_KEY`, `AWS_ASSETS_DISTRIBUTION_ID`, `AWS_APP_DISTRIBUTION_ID`. The following secrets are stored in AWS Secrets Manager and are used by services: `enlighten-mongodb-credentials`, `enlighten-github-oauth-credentials`, `enlighten-google-oauth-credentials`.

### 🖥️ EC2

Runs the Ubuntu Server AMI. Needs CodeDeploy agent installed and running (https://docs.aws.amazon.com/codedeploy/latest/userguide/codedeploy-agent-operations-install-ubuntu.html).
