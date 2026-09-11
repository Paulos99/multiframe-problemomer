import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

const redirect = sessionStorage.getItem('mf-spa-redirect');
if (redirect) {
  sessionStorage.removeItem('mf-spa-redirect');
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (redirect.startsWith(base) && redirect !== `${base}/` && redirect !== base) {
    history.replaceState(null, '', redirect);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
