import React, { createContext, useContext, useState, useEffect } from 'react';
import { Club } from '../types';
import { firebaseService } from '../firebase/firebaseService';

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
    loadClubs();
    const savedClub = localStorage.getItem('currentClub');
    if (savedClub) {
      try {
        const club = JSON.parse(savedClub);
        club.createdAt = new Date(club.createdAt);
        setCurrentClubState(club);
      } catch (error) {
        console.error('Error loading saved club:', error);
      }
    }
  }, []);

  const loadClubs = async () => {
    try {
      const loadedClubs = await firebaseService.getAllClubs();
      setClubs(loadedClubs);
    } catch (error) {
      console.error('Error loading clubs:', error);
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
