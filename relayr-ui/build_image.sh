#!/bin/sh

docker buildx build . \
  --platform linux/amd64,linux/arm64 \
  --tag ghcr.io/rifuki/relayr-ui:latest \
  --tag ghcr.io/rifuki/relayr-ui:$(git rev-parse --short HEAD) \
  --no-cache \
  --push
