#!/bin/sh

export $(grep -v '^#' .env.production | xargs) 

docker buildx build . \
  --platform linux/amd64,linux/arm64 \
  --build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
  --tag ghcr.io/rifuki/relayr/relayr-ui:latest \
  --tag ghcr.io/rifuki/relayr/relayr-ui:$(git rev-parse --short HEAD) \
  --push
