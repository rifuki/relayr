# Stage 1: Build
FROM rust:1.88-alpine AS builder
ARG TARGETPLATFORM
WORKDIR /usr/src/app

# Install base dependencies
RUN apk add --no-cache musl-dev build-base gcc binutils

# Set up target - use native compilation for the target platform
RUN if [ "$TARGETPLATFORM" = "linux/amd64" ]; then \
    rustup target add x86_64-unknown-linux-musl; \
    echo "x86_64-unknown-linux-musl" > /tmp/target; \
  elif [ "$TARGETPLATFORM" = "linux/arm64" ]; then \
    rustup target add aarch64-unknown-linux-musl; \
    echo "aarch64-unknown-linux-musl" > /tmp/target; \
  else \
    echo "Unsupported platform: $TARGETPLATFORM" && exit 1; \
  fi

# Copy manifest and cache deps
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN TARGET=$(cat /tmp/target) && \
  cargo build --release --target $TARGET --locked && \
  rm -rf src 

# Copy actual source code and build binary
COPY . .
RUN TARGET=$(cat /tmp/target) && \
  cargo build --release --target $TARGET --locked && \
  strip target/$TARGET/release/relayr-api && \
  cp target/$TARGET/release/relayr-api ./relayr-api

# Stage 2: Distroless runtime
FROM gcr.io/distroless/static:nonroot
WORKDIR /app
COPY --from=builder /usr/src/app/relayr-api ./relayr-api
# Use the nonroot user provided by distroless image for better security
USER nonroot
EXPOSE 8080
CMD ["/app/relayr-api"]

LABEL org.opencontainers.image.source="https://github.com/rifuki/relayr"

