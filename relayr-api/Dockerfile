# Stage 1: Build stage - use Rust official image based on Alpine Linux
FROM rust:1.85-alpine AS builder

# Install required build dependencies
# musl libc development files for static linking
# meta package including gcc, libc-dev, etc.
# GNU C compiler
RUN apk add --no-cache \
    musl-dev \
    build-base \
    gcc                 

# Set working directory inside container
WORKDIR /usr/src/app

# Copy manifest files to leverage Docker cache for dependencies
COPY Cargo.toml Cargo.lock ./

# Add musl target for static linking to produce fully static binary
RUN rustup target add x86_64-unknown-linux-musl

# Dummy build step to cache dependencies layer
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release --target x86_64-unknown-linux-musl
RUN rm -rf src

# Copy full source code into working directory
COPY . .

# Build the actual release binary statically linked for musl target
RUN cargo build --release --target x86_64-unknown-linux-musl

# Stage 2: Distroless runtime image - minimal, no shell or package manager
FROM gcr.io/distroless/static:nonroot

# Copy the statically linked binary from builder stage
COPY --from=builder /usr/src/app/target/x86_64-unknown-linux-musl/release/relayr-api /relayr-api

# Use the nonroot user provided by distroless image for better security
USER nonroot

# Expose the port where the app listens
EXPOSE 9001

# Run the binary as container entrypoint
CMD ["/relayr-api"]
