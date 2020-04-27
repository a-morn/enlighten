# Enlighten - a multiplayer quiz app

This is a portfolio project for Albin Sebastian Mörner. The goal is to showcase proficiency in modern full stack web development. The project is live at [enlighten.rip](https://enlighten.rip).

## Tech stack

- React.js (CRA), Tailwind CSS, Apollo GraphQL, Cypress, Jest, React Testing Library
- Node.js, Typescript, Apollo GraphQL, Express.js, Redis
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

- Start Redis
- `cd services/bff && npm install && npm run build:dev && npm run start:develop`
- `cd services/worker && npm install &`
- `cd clients/assets && npm install && npm start`
- `cd clients/app && npm install && npm start`
- Direct you browser to localhost:8000

### Debugging BFF

#### Single instace

Run the service with VS Code and the `Launch BFF` configuration.

#### Multiple debuggable instances

Run the service with VS Code and the `Launch BFFs` configuration.

## Production

The workflows defined in `.github/workflows/*-production.yml` deploy to production. There's currently no staging env. The following secrets are stored on Github: `AWS_ACCESS_KEY_ID`, `AWS_DEFAULT_REGION`, `AWS_PRODUCTION_BUCKET_NAME`, `AWS_SECRET_ACCESS_KEY`.

### Cloudformation

The infrastructure is not yet defined with CloudFormation. To create what's done thusfar run:

`aws cloudformation create-stack --stack-name enlighten --template-body file://cloud-formation/worker.yml --parameters ParameterKey=KeyName,ParameterValue=MY_KEY.pem ParameterKey=CodeDeployServiceRoleArn,ParameterValue=CODE_DEPLOY_SERVICE_ROLE_ARN --capabilities CAPABILITY_NAMED_IAM`

### EC2

Runs the Ubuntu Server AMI. Needs CodeDeploy agent installed and running. (https://docs.aws.amazon.com/codedeploy/latest/userguide/codedeploy-agent-operations-install-ubuntu.html)
