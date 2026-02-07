import React from 'react';
import { usePartita } from '../context/PartitaContext';
import '../styles/GestioneEventi.css';

function GestioneEventi() {
  const { state, dispatch } = usePartita();
  const { eventi, squadraBianca, squadraNera } = state;

  const handleBack = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'partita' });
  };

  // Trova il tempo (1-4) da una chiave
  const getTempoNumero = (tempoKey) => {
    const map = { primo: 1, secondo: 2, terzo: 3, quarto: 4 };
    return map[tempoKey];
  };

  // Elimina un evento e aggiorna punteggi/falli di conseguenza
  const eliminaEvento = (tempoKey, index, evento) => {
    if (!window.confirm(`Eliminare questo evento?\n\n${evento.tempo} - ${evento.tipoEvento}`)) {
      return;
    }

    const tempoNumero = getTempoNumero(tempoKey);

    // Se era un GOL, decrementa punteggio e reti giocatore
    if (evento.tipoEvento === 'Gol') {
      const squadra = evento.calottaBianco ? 'B' : 'N';
      const numero = evento.calottaBianco || evento.calottaNero;
      
      dispatch({ type: 'DECREMENT_PUNTEGGIO', payload: { squadra, tempo: tempoNumero } });
      dispatch({ type: 'DECREMENT_RETI_GIOCATORE', payload: { 
        squadra, 
        numeroGiocatore: parseInt(numero),
        tempo: tempoNumero 
      }});
    }

    // Se era un ET o TR, rimuovi ultimo fallo del giocatore
    if (evento.tipoEvento === 'ET' || evento.tipoEvento === 'TR') {
      const squadra = evento.calottaBianco ? 'B' : 'N';
      const numero = evento.calottaBianco || evento.calottaNero;
      
      dispatch({ type: 'REMOVE_LAST_FALLO_GIOCATORE', payload: { 
        squadra, 
        numeroGiocatore: parseInt(numero)
      }});
    }

    // Se era un Timeout, decrementa timeout
    if (evento.tipoEvento === 'Timeout') {
      const squadra = evento.calottaBianco === 'TO' ? 'B' : 'N';
      dispatch({ type: 'DECREMENT_TIMEOUT', payload: squadra });
    }

    // Rimuovi l'evento dalla lista
    dispatch({ type: 'REMOVE_EVENTO', payload: { tempoKey, index } });
  };

  // Conta totale eventi
  const totaleEventi = Object.values(eventi).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="gestione-eventi-screen">
      <div className="gestione-header">
        <button className="btn-back" onClick={handleBack}>← TORNA ALLA PARTITA</button>
        <h2>📋 GESTIONE EVENTI ({totaleEventi})</h2>
      </div>

      <div className="gestione-content">
        <p className="info-text">
          Clicca su ❌ per eliminare un evento errato. Il punteggio e i falli verranno corretti automaticamente.
        </p>

        {['primo', 'secondo', 'terzo', 'quarto'].map((tempoKey, tempoIdx) => (
          <div key={tempoKey} className="tempo-section">
            <h3>{tempoIdx + 1}° TEMPO ({eventi[tempoKey].length} eventi)</h3>
            
            {eventi[tempoKey].length === 0 ? (
              <p className="no-eventi">Nessun evento</p>
            ) : (
              <table className="eventi-table">
                <thead>
                  <tr>
                    <th>Tempo</th>
                    <th>Squadra</th>
                    <th>N°</th>
                    <th>Evento</th>
                    <th>Punt.</th>
                    <th>Elimina</th>
                  </tr>
                </thead>
                <tbody>
                  {eventi[tempoKey].map((evento, index) => {
                    const isGol = evento.tipoEvento === 'Gol';
                    const isET = evento.tipoEvento === 'ET';
                    const isTR = evento.tipoEvento === 'TR';
                    const isTimeout = evento.tipoEvento === 'Timeout';
                    const squadra = evento.calottaBianco ? 'B' : 'N';
                    const numero = evento.calottaBianco || evento.calottaNero;

                    return (
                      <tr key={index} className={`evento-row ${evento.tipoEvento.toLowerCase()}`}>
                        <td>{evento.tempo}</td>
                        <td className={squadra === 'B' ? 'squadra-bianca' : 'squadra-nera'}>
                          {squadra === 'B' ? squadraBianca.nome || 'BIANCO' : squadraNera.nome || 'NERO'}
                        </td>
                        <td>{numero}</td>
                        <td>
                          {isGol && '⚽ Gol'}
                          {isET && '🟨 ET'}
                          {isTR && '🎯 TR'}
                          {isTimeout && '⏱ Timeout'}
                        </td>
                        <td>{evento.punteggio || '-'}</td>
                        <td>
                          <button 
                            className="btn-elimina"
                            onClick={() => eliminaEvento(tempoKey, index, evento)}
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GestioneEventi;