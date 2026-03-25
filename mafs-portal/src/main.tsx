import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

// This check prevents the "implicitly has type any" and "possibly null" errors
if (!rootElement) {
  throw new Error('Failed to find the root element. Ensure index.html has <div id="root"></div>');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
