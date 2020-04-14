# Enlighten - a multiplayer quiz app

This is a portfolio project for Albin Sebastian Mörner. The goal is to showcase proficiency in modern full stack web development. The project is live at [enlighten.rip](enlighten.rip).

## Tech stack

- React.js (CRA), Tailwind CSS, Apollo GraphQL, Cypress, Jest, Enzyme, Testing Library
- Node.js, Apollo GraphQL, Express.js, Redis
- Github (Github Actions)
- AWS (S3, CloudFront, Route 53, EC2, ELB, ElastiCache)

### Infrastructure
 - Client/Static assets/Build artefacts (enlighten.rip/assets.enlighten.rip/artefacts.enligten.rip) - Route 53/CloudFront/S3 - Deployed to S3 by Github Actions
 - Service (api.enlighten.rip) - Route 53/ELB/EC2 + ElastiCache - Deployed to EC2 by Code Deploy using build artefact from S3

## Development
### Dependencies
- node@12.x
- npm@6.x
- Redis (running on port 6379).

### Running the app
- `cd services/bff && npm install && npm run build:dev && npm run start:develop`
- `cd clients/assets && npm install && cd public && npx serve -l 8080`
- `cd clients/app && npm install && npm start`
- Direct you browser to localhost:8000

### Debugging BFF
Build the project (`npm run build:dev`) and run the service with VS Code and the BFF configuration.

## Production
The workflows defined in `.github/workflows/*-production.yml` deploy to production. There's currently no staging env. Cloud formation coming soon...

### EC2
Runs the Ubuntu Server AMI. Needs CodeDeploy agent installed and running. (https://docs.aws.amazon.com/codedeploy/latest/userguide/codedeploy-agent-operations-install-ubuntu.html)
