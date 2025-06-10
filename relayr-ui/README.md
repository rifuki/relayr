# Relayr UI

Frontend application for Relayr built with Next.js and TypeScript.

## Technologies

- **Framework**: Next.js 15.3.1
- **Runtime**: React 19
- **Language**: TypeScript
- **Package Manager**: Bun
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Animations**: Motion
- **Notifications**: Sonner
- **WebSocket**: react-use-websocket

## Features

- Modern React with Server Components
- TypeScript for type safety
- Responsive design with Tailwind CSS
- Dark/Light mode support
- WebSocket integration
- Real-time updates
- Performance monitoring with Vercel Analytics
- Optimized builds with Turbopack

## Getting Started

1. Install dependencies:
```bash
bun install
```

2. Run development server:
```bash
bun run dev
```

3. Build for production:
```bash
bun run build
```

4. Run production server:
```bash
bun run start
```

## Scripts

- `bun run dev` - Run development server with Turbopack
- `bun run build` - Build application for production
- `bun run start` - Run production server
- `bun run lint` - Run ESLint
- `bun run get-ip` - Get local IP
- `bun run set-ip` - Set local IP

## Project Structure

```
src/
├── app/          # Routing and pages
├── components/   # Reusable components
├── lib/         # Utilities and helper functions
├── stores/      # State management
├── hooks/       # Custom React hooks
├── types/       # TypeScript definitions
├── providers/   # Context providers
└── utils/       # Utility functions
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
