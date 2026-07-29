import React, { useState } from 'react';
import { ClubProvider, useClub } from '../context/ClubContext';
import { ClubSelector } from './ClubSelector';
import { CreateClubForm } from './CreateClubForm';
import { AdminPanel } from './AdminPanel';
import App from '../App';
import { Club } from '../types';

function ClubAppContent() {
  const { currentClub, clubs, setCurrentClub, createClub, verifyPassword, loadClubs, logout } = useClub();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleSelectClub = async (clubId: string, password: string) => {
    setAuthError('');
    const isValid = await verifyPassword(clubId, password);

    if (isValid) {
      const club = clubs.find(c => c.id === clubId);
      if (club) {
        setCurrentClub(club);
      }
    } else {
      setAuthError('Contraseña incorrecta');
    }
  };

  const handleCreateClub = async (clubData: Omit<Club, 'id' | 'createdAt'>) => {
    try {
      const clubId = await createClub(clubData);
      await loadClubs();

      const newClub = clubs.find(c => c.id === clubId) || {
        id: clubId,
        ...clubData,
        createdAt: new Date()
      };

      setCurrentClub(newClub);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating club:', error);
      alert('Error al crear el club. Por favor intenta de nuevo.');
    }
  };

  if (showAdminPanel) {
    return <AdminPanel onClose={() => setShowAdminPanel(false)} />;
  }

  if (!currentClub) {
    if (showCreateForm) {
      return (
        <CreateClubForm
          onCreateClub={handleCreateClub}
          onCancel={() => setShowCreateForm(false)}
        />
      );
    }

    return (
      <ClubSelector
        clubs={clubs}
        onSelectClub={handleSelectClub}
        onCreateClub={() => setShowCreateForm(true)}
        onAdminMode={() => setShowAdminPanel(true)}
        error={authError}
      />
    );
  }

  return <App clubId={currentClub.id} onLogout={logout} clubName={currentClub.name} />;
}

export function ClubApp() {
  return (
    <ClubProvider>
      <ClubAppContent />
    </ClubProvider>
  );
}
