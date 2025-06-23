// Constants for Chunk Size
const CHUNK_SIZE = 32 * 1024; // 32 KB chunk size for file transfers

// Environment-specific configurations
const isDev = process.env.NODE_ENV === "development";

// Export constants for use in other parts of the application
export { CHUNK_SIZE, isDev };
