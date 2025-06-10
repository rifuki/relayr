# Relayr API

Backend API server for Relayr application built with Rust and Axum.

## Technologies

- **Language**: Rust
- **Web Framework**: Axum
- **Async Runtime**: Tokio
- **Serialization**: Serde
- **Logging**: Tracing
- **WebSocket**: Axum WebSocket
- **CORS**: Tower HTTP
- **Container**: Docker (multiple variants)

## Features

- High-performance async API server
- WebSocket support for real-time communication
- CORS support
- Structured logging with tracing
- Environment variable configuration
- Multiple Docker image variants
- Optimized release builds

## Getting Started

### Prerequisites

- Rust (latest stable)
- Cargo
- Docker (optional)

### Development

1. Clone repository:
```bash
git clone https://github.com/yourusername/relayr-api.git
cd relayr-api
```

2. Install dependencies:
```bash
cargo build
```

3. Run server:
```bash
cargo run
```

### Docker

Multiple Docker image variants available:

1. Default image:
```bash
docker build -t relayr-api .
```

2. Alpine-based image:
```bash
docker build -f Dockerfile.alpine -t relayr-api:alpine .
```

3. Debian-based image:
```bash
docker build -f Dockerfile.debian -t relayr-api:debian .
```

Or use the build script:
```bash
./build_container.sh
```

## Project Structure

```
src/
├── main.rs      # Application entry point
├── lib.rs       # Library exports
├── config.rs    # Application configuration
├── routes.rs    # Route definitions
└── relay/       # Relay logic implementation
```

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=3000
RUST_LOG=info
```

## API Endpoints

- `GET /ping` - Health check endpoint
- `GET /api/v1/*` - API routes

## Development Features

### Console Mode

Enable console mode for debugging:

```bash
cargo run --features console
```

Console client can be accessed at `127.0.0.1:6669`

## Build Profiles

- `release`: Optimized production build
- `release-debug`: Debuggable production build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 