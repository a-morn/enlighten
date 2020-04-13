# Enlighten

## Dependencies
- node@12.x
- npm@6.x

## Services
- Github (Github Actions)
- AWS

## Development

- `cd services/bff && npm install && npm run build:dev && npm run start:develop`
- `cd services/assets && npm install && cd public && npx serve -l 8080`
- `cd clients/app && npm install && npm start`
- App is now running on localhost:8000

### BFF
For debugging: build the project (`npm run build:dev`) and run the service with VS Code and the BFF configuration.

## Production
The workflows defined in `.github/workflows/*-production.yml` deploy to production. There's currently no staging env. Cloud formation for prod coming soon...