import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import QrPage from './QrPage';
import './styles.css';
import './qr.css';
createRoot(document.getElementById('root')!).render(<StrictMode><QrPage /></StrictMode>);
