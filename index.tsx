
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log('App initializing...', {
  hasSupabase: !!import.meta.env.VITE_SUPABASE_URL,
  hasGemini: !!import.meta.env.VITE_GEMINI_API_KEY,
  mode: import.meta.env.MODE
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
