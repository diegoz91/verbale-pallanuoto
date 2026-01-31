import React from 'react';
import { usePartita } from '../context/PartitaContext';
import '../styles/Giocatori.css';

function Giocatori() {
  const { state, dispatch } = usePartita();
  const { viewingTeam, squadraBianca, squadraNera } = state;
  
  const squadra = viewingTeam === 'B' ? squadraBianca : squadraNera;
  const colore = viewingTeam === 'B' ? 'Bianca' : 'Nera';

  const handleBack = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'partita' });
  };

  const getTotaleReti = (giocatore) => {
    return giocatore.reti.primo + giocatore.reti.secondo + 
           giocatore.reti.terzo + giocatore.reti.quarto;
  };

  const getFalloStyle = (livello) => {
    if (livello === 2) return 'fallo-giallo';
    if (livello === 3) return 'fallo-rosso';
    return '';
  };

  return (
    <div className={`giocatori-screen ${viewingTeam?.toLowerCase()}`}>
      <div className="header">
        <button className="btn-back" onClick={handleBack}>← TORNA</button>
        <h1>SQUADRA {colore.toUpperCase()}</h1>
        <h2>{squadra.nome || `Squadra ${colore}`}</h2>
      </div>

      <div className="giocatori-table">
        <div className="table-header-row">
          <span className="col-num">N°</span>
          <span className="col-nome">GIOCATORE</span>
          <span className="col-tessera">TESSERA</span>
          <span className="col-reti">1°T</span>
          <span className="col-reti">2°T</span>
          <span className="col-reti">3°T</span>
          <span className="col-reti">4°T</span>
          <span className="col-reti-tot">TOT</span>
          <span className="col-falli">FALLO 1</span>
          <span className="col-falli">FALLO 2</span>
          <span className="col-falli">FALLO 3</span>
        </div>

        <div className="table-body">
          {squadra.giocatori.map((giocatore, index) => (
            <div key={index} className={`table-row ${giocatore.falliPersonali.length >= 3 ? 'espulso' : ''}`}>
              <span className="col-num">{giocatore.numero}</span>
              <span className="col-nome">{giocatore.nome || '-'}</span>
              <span className="col-tessera">{giocatore.tesseraFIN || '-'}</span>
              <span className="col-reti">{giocatore.reti.primo || '-'}</span>
              <span className="col-reti">{giocatore.reti.secondo || '-'}</span>
              <span className="col-reti">{giocatore.reti.terzo || '-'}</span>
              <span className="col-reti">{giocatore.reti.quarto || '-'}</span>
              <span className="col-reti-tot">{getTotaleReti(giocatore) || '-'}</span>
              
              {/* Falli personali */}
              {[0, 1, 2].map(falloIndex => {
                const fallo = giocatore.falliPersonali[falloIndex];
                return (
                  <span 
                    key={falloIndex} 
                    className={`col-falli ${fallo ? getFalloStyle(fallo.livello) : ''}`}
                  >
                    {fallo ? (
                      <>
                        <span className="fallo-tempo">{fallo.tempo}</span>
                        <span className="fallo-tipo">{fallo.tipo}</span>
                      </>
                    ) : '-'}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="legenda">
        <h3>Legenda Falli:</h3>
        <span className="legenda-item">ET = Espulsione Temporanea</span>
        <span className="legenda-item">TR = Tiro Rigore concesso</span>
        <span className="legenda-item fallo-giallo">■ 2° Fallo (Ammonizione)</span>
        <span className="legenda-item fallo-rosso">■ 3° Fallo (Espulsione)</span>
      </div>

      <div className="stats-summary">
        <div className="stat-box">
          <span className="stat-label">Punteggio Finale</span>
          <span className="stat-value">{squadra.punteggioFinale || 
            (viewingTeam === 'B' 
              ? state.parziali.primo.bianco + state.parziali.secondo.bianco + state.parziali.terzo.bianco + state.parziali.quarto.bianco
              : state.parziali.primo.nero + state.parziali.secondo.nero + state.parziali.terzo.nero + state.parziali.quarto.nero
            )
          }</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Timeout Usati</span>
          <span className="stat-value">{squadra.timeoutUsati} / 2</span>
        </div>
      </div>
    </div>
  );
}

export default Giocatori;
