# Sage - Tauri AI Chat Application

## Architecture
- **Frontend**: React + TypeScript + Vite in `src/`
- **Backend**: Rust + Tauri in `src-tauri/`
- **AI Service**: Mistral API integration with markdown processing
- **Features**: Chat interface, knowledge management, and AI-powered conversations

## Build/Test Commands
- `pnpm run dev` - Start development server
- `pnpm run build` - Build frontend (includes TypeScript compilation)
- `pnpm run tauri dev` - Start Tauri development mode
- `pnpm run test:visual` - Run Playwright visual tests
- `pnpm run test:visual:debug` - Debug Playwright tests
- `cargo test` - Run Rust unit tests (in src-tauri/)
- `cargo test <test_name>` - Run specific Rust test
- `cargo check` - Check Rust compilation without building

## Code Style
- **TypeScript**: Strict mode enabled, React functional components with hooks
- **Rust**: Standard rustfmt, use `Arc` for shared state, `Result<T, String>` for errors
- **Imports**: Absolute imports in TypeScript, grouped imports in Rust
- **Naming**: camelCase for TypeScript, snake_case for Rust, PascalCase for components/types
- **Error Handling**: Result types in Rust, try/catch in TypeScript with proper error messages
- **File Organization**: Feature-based folders in `src/`, module-based in `src-tauri/src/`
