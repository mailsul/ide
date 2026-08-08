import { createRoot } from 'react-dom/client';
import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';
import App from './App';
import { getStoredToken } from './lib/token-storage';

import './index.css';

// Set API base URL dari environment variable yang di-inject saat build Docker
// VITE_API_URL di-set di docker-compose.yml: https://api.DOMAIN
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl && apiUrl !== '/api') {
  setBaseUrl(apiUrl);
}

// Pasang token getter — setiap request API akan otomatis menyertakan
// Authorization: Bearer <token>. Getter membaca localStorage DAN
// sessionStorage, karena login tanpa "Ingat saya" menyimpan token di
// sessionStorage.
setAuthTokenGetter(() => getStoredToken());

createRoot(document.getElementById('root')!).render(<App />);
