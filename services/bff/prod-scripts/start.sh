#!/bin/bash
cd /srv
NODE_ENV=production npx pm2 start ecosystem.config.js
