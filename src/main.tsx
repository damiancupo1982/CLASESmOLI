import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClubApp } from './components/ClubApp';
import './index.css';
import './utils/migrateToFirebase';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClubApp />
  </StrictMode>
);
