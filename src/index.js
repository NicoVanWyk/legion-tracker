import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Wait for the DOM to be fully loaded
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);