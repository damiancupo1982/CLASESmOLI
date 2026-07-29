import React from 'react';
import { Users, Calendar, DollarSign, FileText, Settings, Trophy } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const menuItems = [
    { id: 'students', label: 'Alumnos', icon: Users },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'billing', label: 'Facturas', icon: DollarSign },
    { id: 'reports', label: 'Reportes', icon: FileText },
    { id: 'receipts', label: 'Recibos', icon: FileText },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <nav className="padel-nav shadow-padel-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="relative">
                <Trophy size={32} className="text-yellow-300 animate-bounce-ball" />
                <span className="absolute -top-1 -right-1 text-lg">🎾</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">PadelPro</h1>
                <p className="text-sm text-green-200">Sistema de Gestión</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover-lift ${
                    currentView === item.id
                      ? 'bg-white text-green-800 shadow-padel transform scale-105'
                      : 'text-green-100 hover:text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}