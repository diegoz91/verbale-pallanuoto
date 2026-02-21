import React from 'react';
import { usePartita } from '../context/PartitaContext';
import { useTabellone } from '../context/TabelloneSyncContext';
import '../styles/Squadre.css';

function Squadre() {
  const { state, dispatch } = usePartita();
  const { connected, syncPlayers } = useTabellone();
  const { squadraBianca, squadraNera } = state;

  const handleSquadraChange = (squadra, field, value) => {
    dispatch({
      type: squadra === 'B' ? 'UPDATE_SQUADRA_BIANCA' : 'UPDATE_SQUADRA_NERA',
      payload: { [field]: value }
    });
  };

  const handleGiocatoreChange = (squadra, index, field, value) => {
    dispatch({
      type: 'UPDATE_GIOCATORE',
      payload: { squadra, index, data: { [field]: value } }
    });
  };

  const handleBack = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'info' });
  };

  const handleStart = () => {
    // Sync giocatori al tabellone se connesso
    if (connected) {
      syncPlayers(squadraBianca, 'B');
      syncPlayers(squadraNera, 'N');
    }
    dispatch({ type: 'SET_SCREEN', payload: 'partita' });
  };

  const renderGiocatoriTable = (squadra, giocatori, colore) => (
    <div className={`squadra-table ${colore.toLowerCase()}`}>
      <div className="squadra-header">
        <input
          type="text"
          className="squadra-nome-input"
          placeholder={`Nome Squadra ${colore === 'B' ? 'Bianca' : 'Nera'}`}
          value={squadra.nome}
          onChange={(e) => handleSquadraChange(colore, 'nome', e.target.value)}
        />
        <span className={`calottina ${colore.toLowerCase()}`}>{colore}</span>
      </div>
      
      <div className="table-header">
        <span className="col-num">N°</span>
        <span className="col-nome">GIOCATORE</span>
        <span className="col-tessera">TESSERA FIN</span>
      </div>
      
      <div className="table-body">
        {giocatori.map((giocatore, index) => (
          <div key={index} className="table-row">
            <span className="col-num">{giocatore.numero}</span>
            <input
              type="text"
              className="col-nome"
              placeholder="Cognome"
              value={giocatore.nome}
              onChange={(e) => handleGiocatoreChange(colore, index, 'nome', e.target.value)}
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="col-tessera"
              placeholder="1234567"
              maxLength="7"
              value={giocatore.tesseraFIN}
              onChange={(e) => handleGiocatoreChange(colore, index, 'tesseraFIN', e.target.value.replace(/\D/g, ''))}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="squadre-screen">
      <div className="header">
        <h1>🤽 SQUADRE</h1>
        <p>Inserisci i giocatori delle due squadre</p>
      </div>

      <div className="squadre-container">
        {renderGiocatoriTable(squadraBianca, squadraBianca.giocatori, 'B')}
        {renderGiocatoriTable(squadraNera, squadraNera.giocatori, 'N')}
      </div>

      <div className="button-container">
        <button className="btn-secondary" onClick={handleBack}>
          ← INDIETRO
        </button>
        {connected && (
          <button className="btn-sync" onClick={() => {
            syncPlayers(squadraBianca, 'B');
            syncPlayers(squadraNera, 'N');
            alert('Giocatori sincronizzati con il tabellone!');
          }}>
            🔄 SYNC TABELLONE
          </button>
        )}
        <button className="btn-primary btn-large" onClick={handleStart}>
          🏊 INIZIA PARTITA {connected ? '(+ sync)' : ''}
        </button>
      </div>
    </div>
  );
}

export default Squadre;