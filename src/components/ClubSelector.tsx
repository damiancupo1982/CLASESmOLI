import React, { useState, useEffect } from 'react';
import { Plus, Lock, Building2, Shield } from 'lucide-react';
import { Club } from '../types';

interface ClubSelectorProps {
  clubs: Club[];
  onSelectClub: (clubId: string, password: string) => void;
  onCreateClub: () => void;
  onAdminMode?: () => void;
  error?: string;
}

export function ClubSelector({ clubs, onSelectClub, onCreateClub, onAdminMode, error }: ClubSelectorProps) {
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const handleClubClick = (clubId: string) => {
    setSelectedClubId(clubId);
    setShowPasswordInput(true);
    setPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClubId && password) {
      onSelectClub(selectedClubId, password);
    }
  };

  const handleCancel = () => {
    setShowPasswordInput(false);
    setSelectedClubId('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistema de Clases</h1>
          <p className="text-gray-600">Selecciona un club para comenzar</p>
        </div>

        {!showPasswordInput ? (
          <div className="space-y-3">
            {clubs.map((club) => (
              <button
                key={club.id}
                onClick={() => handleClubClick(club.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all border-2 border-transparent hover:border-blue-300 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">
                      {club.name}
                    </h3>
                    {club.description && (
                      <p className="text-sm text-gray-500">{club.description}</p>
                    )}
                  </div>
                </div>
                <Lock className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              </button>
            ))}

            <button
              onClick={onCreateClub}
              className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Crear Nuevo Club</span>
            </button>

            {onAdminMode && (
              <button
                onClick={onAdminMode}
                className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white rounded-lg transition-all shadow-lg hover:shadow-xl border-2 border-gray-600"
              >
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Modo Administrador</span>
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                Club seleccionado: {clubs.find(c => c.id === selectedClubId)?.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña del Club
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa la contraseña"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Ingresar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
