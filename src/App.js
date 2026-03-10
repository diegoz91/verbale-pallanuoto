import React, { useEffect } from 'react';
import { PartitaProvider, usePartita } from './context/PartitaContext';
import { TabelloneSyncProvider } from './context/TabelloneSyncContext';
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

  // Fullscreen: nasconde la barra di stato del browser/Android
  useEffect(() => {
    const requestFullscreen = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    };

    // Prova subito al primo tap (serve interazione utente per fullscreen)
    const handleFirstTouch = () => {
      requestFullscreen();
      document.removeEventListener('touchstart', handleFirstTouch);
      document.removeEventListener('click', handleFirstTouch);
    };
    
    document.addEventListener('touchstart', handleFirstTouch, { once: true });
    document.addEventListener('click', handleFirstTouch, { once: true });

    // Impedisci uscita dal fullscreen
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        // Se esce dal fullscreen, riprova al prossimo tap
        document.addEventListener('touchstart', handleFirstTouch, { once: true });
        document.addEventListener('click', handleFirstTouch, { once: true });
      }
    });

    return () => {
      document.removeEventListener('touchstart', handleFirstTouch);
      document.removeEventListener('click', handleFirstTouch);
    };
  }, []);

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
      <TabelloneSyncProvider>
        <AppContent />
      </TabelloneSyncProvider>
    </PartitaProvider>
  );
}

export default App;