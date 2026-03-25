import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#151515',
            color: '#e5e5e5',
            border: '1px solid #222',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#00ff41', secondary: '#0a0a0a' } },
          error: { iconTheme: { primary: '#ff4444', secondary: '#0a0a0a' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
