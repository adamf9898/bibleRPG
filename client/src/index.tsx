import React from 'react';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <div>Hello, Bible RPG!</div>
        </React.StrictMode>
    );
} else {
    console.error('Root element not found');
}