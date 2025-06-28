#!/bin/sh

docker buildx build . \
  --platform linux/amd64,linux/arm64 \
  --tag ghcr.io/rifuki/relayr/relayr-api:latest \
  --tag ghcr.io/rifuki/relayr/relayr-api:$(git rev-parse --short HEAD) \
  --push

