#!/bin/bash

docker buildx build --platform linux/amd64 --tag rifuki/relayr-api:latest --load .
docker push rifuki/relayr-api:latest
