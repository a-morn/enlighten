#!/bin/sh
cd ./services/assets
trap 'kill $ASSET_PID; exit' INT
npx http-server&
ASSET_PID=$!
cd ../bff
trap 'kill $BFF_PID; exit' INT
npm start&
BFF_PID=$!
cd ../../clients/app
trap 'kill $APP_PID; exit' INT
npm start&
APP_PID=$!

