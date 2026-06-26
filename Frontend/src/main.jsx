import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if (typeof window !== 'undefined') {
  const noop = () => {};
  ['log', 'info', 'debug', 'warn', 'error'].forEach((method) => {
    if (console[method]) {
      console[method] = noop;
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
