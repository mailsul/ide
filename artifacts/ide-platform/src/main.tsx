import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';
import App from './App';

import './index.css';

// Set API base URL dari environment variable yang di-inject saat build Docker
// VITE_API_URL di-set di docker-compose.yml: https://api.DOMAIN
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl && apiUrl !== '/api') {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById('root')!).render(<App />);
