import React, { createContext, useContext, useState, useEffect } from 'react';
import { Club } from '../types';
import { firebaseService } from '../firebase/firebaseService';
import { hasLegacyData, migrateLocalStorageToClub } from '../utils/migrateToFirebase';

interface ClubContextType {
  currentClub: Club | null;
  clubs: Club[];
  setCurrentClub: (club: Club | null) => void;
  createClub: (clubData: Omit<Club, 'id' | 'createdAt'>) => Promise<string>;
  updateClub: (clubId: string, updates: Partial<Omit<Club, 'id' | 'createdAt'>>) => Promise<void>;
  deleteClub: (clubId: string) => Promise<void>;
  verifyPassword: (clubId: string, password: string) => Promise<boolean>;
  loadClubs: () => Promise<void>;
  logout: () => void;
}

const ClubContext = createContext<ClubContextType>({
  currentClub: null,
  clubs: [],
  setCurrentClub: () => {},
  createClub: async () => '',
  updateClub: async () => {},
  deleteClub: async () => {},
  verifyPassword: async () => false,
  loadClubs: async () => {},
  logout: () => {}
});

export function ClubProvider({ children }: { children: React.ReactNode }) {
  const [currentClub, setCurrentClubState] = useState<Club | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    const bootstrap = async () => {
      const loadedClubs = await loadClubs();
      const savedClub = localStorage.getItem('currentClub');
      if (!savedClub) return;
      try {
        const parsedClub = JSON.parse(savedClub);
        const club = loadedClubs.find(item => item.id === parsedClub.id);
        if (club) setCurrentClubState(club);
      } catch (error) {
        console.error('Error loading saved club:', error);
      }
    };
    bootstrap();
  }, []);

  const loadClubs = async () => {
    try {
      let loadedClubs = await firebaseService.getAllClubs();
      if (loadedClubs.length === 0 && hasLegacyData()) {
        const savedClub = JSON.parse(localStorage.getItem('currentClub') || 'null');
        const recoveredClubId = await firebaseService.createClub({
          name: savedClub?.name || 'Club recuperado',
          password: savedClub?.password || 'recuperado',
          description: savedClub?.description || 'Datos recuperados del navegador'
        });
        await migrateLocalStorageToClub(recoveredClubId);
        loadedClubs = await firebaseService.getAllClubs();
        const recoveredClub = loadedClubs.find(club => club.id === recoveredClubId);
        if (recoveredClub) {
          setCurrentClubState(recoveredClub);
          localStorage.setItem('currentClub', JSON.stringify(recoveredClub));
        }
      }
      setClubs(loadedClubs);
      return loadedClubs;
    } catch (error) {
      console.error('Error loading clubs:', error);
      return [];
    }
  };

  const setCurrentClub = (club: Club | null) => {
    setCurrentClubState(club);
    if (club) {
      localStorage.setItem('currentClub', JSON.stringify(club));
    } else {
      localStorage.removeItem('currentClub');
    }
  };

  const createClub = async (clubData: Omit<Club, 'id' | 'createdAt'>) => {
    const clubId = await firebaseService.createClub(clubData);
    await loadClubs();
    return clubId;
  };

  const updateClub = async (clubId: string, updates: Partial<Omit<Club, 'id' | 'createdAt'>>) => {
    await firebaseService.updateClub(clubId, updates);
    await loadClubs();
    if (currentClub && currentClub.id === clubId) {
      const updatedClub = await firebaseService.getClub(clubId);
      if (updatedClub) {
        setCurrentClub(updatedClub);
      }
    }
  };

  const deleteClub = async (clubId: string) => {
    await firebaseService.deleteClub(clubId);
    await loadClubs();
    if (currentClub && currentClub.id === clubId) {
      setCurrentClub(null);
    }
  };

  const verifyPassword = async (clubId: string, password: string) => {
    return await firebaseService.verifyClubPassword(clubId, password);
  };

  const logout = () => {
    setCurrentClub(null);
  };

  return (
    <ClubContext.Provider value={{
      currentClub,
      clubs,
      setCurrentClub,
      createClub,
      updateClub,
      deleteClub,
      verifyPassword,
      loadClubs,
      logout
    }}>
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  return useContext(ClubContext);
}
