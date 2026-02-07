import React from 'react';
import { PartitaProvider, usePartita } from './context/PartitaContext';
import InfoPartita from './components/InfoPartita';
import Squadre from './components/Squadre';
import PartitaLive from './components/PartitaLive';
import Verbale from './components/Verbale';
import Giocatori from './components/Giocatori';
import AllegatoSanzioni from './components/AllegatoSanzioni';
import GestioneEventi from './components/GestioneEventi';
import './styles/App.css';

function AppContent() {
  const { state } = usePartita();

  const renderScreen = () => {
    switch (state.currentScreen) {
      case 'info':
        return <InfoPartita />;
      case 'squadre':
        return <Squadre />;
      case 'partita':
        return <PartitaLive />;
      case 'verbale':
        return <Verbale />;
      case 'giocatori':
        return <Giocatori />;
      case 'allegato':
        return <AllegatoSanzioni />;
      case 'gestione-eventi':
        return <GestioneEventi />;
      default:
        return <InfoPartita />;
    }
  };

  return (
    <div className="app">
      {renderScreen()}
    </div>
  );
}

function App() {
  return (
    <PartitaProvider>
      <AppContent />
    </PartitaProvider>
  );
}

export default App;