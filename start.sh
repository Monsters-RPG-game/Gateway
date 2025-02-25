#!/bin/bash

echo "Starting migrations"
npm run migrate

echo "Starting service"

npm run start
