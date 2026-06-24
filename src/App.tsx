import React, { useState } from 'react';
import { AppProvider } from './context/AppContextWithClub';
import { Navigation } from './components/Navigation';
import { StudentList } from './components/StudentList';
import { Calendar } from './components/Calendar';
import { BillingModule } from './components/BillingModule';
import { Reports } from './components/Reports';
import { ReceiptsHistory } from './components/ReceiptsHistory';
import { BackupRestore } from './components/BackupRestore';
import { Settings, LogOut } from 'lucide-react';

interface AppProps {
  clubId: string;
  clubName: string;
  onLogout: () => void;
}

function App({ clubId, clubName, onLogout }: AppProps) {
  const [currentView, setCurrentView] = useState('students');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'students':
        return <StudentList />;
      case 'calendar':
        return <Calendar />;
      case 'billing':
        return <BillingModule />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <BackupRestore clubId={clubId} clubName={clubName} />;
      case 'receipts':
  return <ReceiptsHistory />;
      default:
        return <StudentList />;
    }
  };

  return (
    <AppProvider clubId={clubId}>
      <div className="min-h-screen bg-padel-light">
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">Club:</div>
            <div className="font-semibold text-blue-600">{clubName}</div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {renderCurrentView()}
        </main>
      </div>
    </AppProvider>
  );
}

export default App;