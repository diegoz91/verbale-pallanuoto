import React from 'react';
import { usePartita } from '../context/PartitaContext';
import '../styles/InfoPartita.css';

function InfoPartita() {
  const { state, dispatch } = usePartita();
  const { infoPartita } = state;

  const handleChange = (field, value) => {
    dispatch({
      type: 'UPDATE_INFO_PARTITA',
      payload: { [field]: value }
    });
  };

  const handleNestedChange = (parent, field, value) => {
    dispatch({
      type: 'UPDATE_INFO_PARTITA',
      payload: {
        [parent]: { ...infoPartita[parent], [field]: value }
      }
    });
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'squadre' });
  };

  return (
    <div className="info-partita-screen">
      <div className="header">
        <h1>🤽 VERBALE PALLANUOTO</h1>
        <p>Inserisci le informazioni della partita</p>
      </div>

      <div className="form-container">
        <div className="form-row">
          <div className="form-section">
            <h2>📅 Informazioni Gara</h2>
            
            <div className="input-group">
              <label>Data Partita</label>
              <input
                type="date"
                value={infoPartita.data}
                onChange={(e) => handleChange('data', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Luogo (Città)</label>
              <input
                type="text"
                placeholder="es: Milano (MI)"
                value={infoPartita.luogo}
                onChange={(e) => handleChange('luogo', e.target.value)}
              />
            </div>

            <div className="input-row">
              <div className="input-group half">
                <label>Ora Inizio</label>
                <input
                  type="time"
                  value={infoPartita.oraInizio}
                  onChange={(e) => handleChange('oraInizio', e.target.value)}
                />
              </div>
              <div className="input-group half">
                <label>Ora Termine</label>
                <input
                  type="time"
                  value={infoPartita.oraTermine}
                  onChange={(e) => handleChange('oraTermine', e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Manifestazione</label>
              <input
                type="text"
                placeholder="es: Campionato Under 18"
                value={infoPartita.manifestazione}
                onChange={(e) => handleChange('manifestazione', e.target.value)}
              />
            </div>
          </div>

          <div className="form-section">
            <h2>⚖️ Arbitri</h2>
            
            <div className="input-row">
              <div className="input-group half">
                <label>Arbitro 1 - Nome</label>
                <input
                  type="text"
                  value={infoPartita.arbitro1.nome}
                  onChange={(e) => handleNestedChange('arbitro1', 'nome', e.target.value)}
                />
              </div>
              <div className="input-group half">
                <label>Cognome</label>
                <input
                  type="text"
                  value={infoPartita.arbitro1.cognome}
                  onChange={(e) => handleNestedChange('arbitro1', 'cognome', e.target.value)}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group half">
                <label>Arbitro 2 - Nome</label>
                <input
                  type="text"
                  value={infoPartita.arbitro2.nome}
                  onChange={(e) => handleNestedChange('arbitro2', 'nome', e.target.value)}
                />
              </div>
              <div className="input-group half">
                <label>Cognome</label>
                <input
                  type="text"
                  value={infoPartita.arbitro2.cognome}
                  onChange={(e) => handleNestedChange('arbitro2', 'cognome', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>📋 Ufficiali di Gara</h2>
            
            <div className="input-row">
              <div className="input-group half">
                <label>Segretario - Nome</label>
                <input
                  type="text"
                  value={infoPartita.segretario.nome}
                  onChange={(e) => handleNestedChange('segretario', 'nome', e.target.value)}
                />
              </div>
              <div className="input-group half">
                <label>Cognome</label>
                <input
                  type="text"
                  value={infoPartita.segretario.cognome}
                  onChange={(e) => handleNestedChange('segretario', 'cognome', e.target.value)}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group half">
                <label>Cronometrista - Nome</label>
                <input
                  type="text"
                  value={infoPartita.cronometrista.nome}
                  onChange={(e) => handleNestedChange('cronometrista', 'nome', e.target.value)}
                />
              </div>
              <div className="input-group half">
                <label>Cognome</label>
                <input
                  type="text"
                  value={infoPartita.cronometrista.cognome}
                  onChange={(e) => handleNestedChange('cronometrista', 'cognome', e.target.value)}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group half">
                <label>Addetto 30" - Nome</label>
                <input
                  type="text"
                  value={infoPartita.addetto30.nome}
                  onChange={(e) => handleNestedChange('addetto30', 'nome', e.target.value)}
                />
              </div>
              <div className="input-group half">
                <label>Cognome</label>
                <input
                  type="text"
                  value={infoPartita.addetto30.cognome}
                  onChange={(e) => handleNestedChange('addetto30', 'cognome', e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Giudici di Porta</label>
              <input
                type="text"
                placeholder="es: Rossi M., Verdi G."
                value={infoPartita.giudiciPorta}
                onChange={(e) => handleChange('giudiciPorta', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="button-container">
          <button className="btn-primary btn-large" onClick={handleContinue}>
            CONTINUA → SQUADRE
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoPartita;
