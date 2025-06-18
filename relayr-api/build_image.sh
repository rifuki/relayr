#!/bin/sh

docker buildx build . \
  --no-cache \
  --platform linux/amd64,linux/arm64 \
  --tag ghcr.io/rifuki/relayr-api:latest \
  --tag ghcr.io/rifuki/relayr-api:$(git rev-parse --short HEAD) \
  --push

