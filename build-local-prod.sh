#!/bin/sh

ENV_FILE="./relayr-ui/env.production"

if [ ! -f "$ENV_FILE" ]; then
  echo "Environment file $ENV_FILE does not exist."
  exit 1
fi

echo "Start building production image..."
docker compose --env-file "$ENV_FILE" up --build -d
echo "Production image built and running."

