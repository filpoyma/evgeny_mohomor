import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StoreProvider } from './app/providers/StoreProvider.tsx';
import { QueryProvider } from './app/providers/QueryProvider.tsx';
import App from './App.tsx';
import './app/styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <QueryProvider>
        <BrowserRouter basename="/muhomor" future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <App />
        </BrowserRouter>
      </QueryProvider>
    </StoreProvider>
  </StrictMode>,
);
