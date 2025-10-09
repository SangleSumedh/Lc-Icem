// src/env.js

// ✅ Access environment variable from Vite
const BASE_URL = import.meta.env.VITE_BACKEND_URI;

// ✅ Optional: fallback to prevent undefined errors in local/dev builds
if (!BASE_URL) {
  console.warn("⚠️  VITE_BACKEND_URI is not defined in your .env file");
}

// ✅ Export for easy import throughout the project
const ENV = {
  BASE_URL,
};

export default ENV;