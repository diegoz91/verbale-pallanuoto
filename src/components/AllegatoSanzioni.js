import React from 'react';
import { usePartita } from '../context/PartitaContext';
import { generateAllegatoPDF } from '../utils/pdfAllegato';
import '../styles/AllegatoSanzioni.css';

function AllegatoSanzioni() {
  const { state, dispatch } = usePartita();
  const { infoPartita, allegatoSanzioni, squadraBianca, squadraNera } = state;

  const handleBack = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'verbale' });
  };

  const handleChange = (field, value) => {
    dispatch({ type: 'UPDATE_ALLEGATO_SANZIONI', payload: { [field]: value } });
  };

  const handleEspulsioneChange = (index, field, value) => {
    dispatch({ 
      type: 'UPDATE_ESPULSIONE', 
      payload: { index, data: { [field]: value } } 
    });
  };

  const handleExportPDF = async () => {
    try {
      await generateAllegatoPDF(state);
      alert('PDF Allegato generato con successo!');
    } catch (error) {
      console.error('Errore generazione PDF:', error);
      alert('Errore nella generazione del PDF');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT');
  };

  return (
    <div className="allegato-screen">
      {/* Barra azioni */}
      <div className="allegato-actions">
        <button className="btn-back" onClick={handleBack}>← TORNA AL VERBALE</button>
        <h2>ALLEGATO SANZIONI</h2>
        <button className="btn-export" onClick={handleExportPDF}>📄 ESPORTA PDF</button>
      </div>

      {/* Contenuto scrollabile */}
      <div className="allegato-scroll">
        <div className="allegato-paper">
          
          {/* INTESTAZIONE */}
          <div className="allegato-header">
            <div className="header-left">
              <div className="fin-logo">FIN</div>
              <div className="fin-text">
                <strong>FEDERAZIONE ITALIANA NUOTO</strong><br />
                GRUPPO UFFICIALI GARA
              </div>
            </div>
            <div className="header-center">
              <strong>ALLEGATO AL VERBALE DI PARTITA DI PALLANUOTO</strong>
              <div className="header-info">
                DEL <strong>{formatDate(infoPartita.data)}</strong> GIOCATA A <strong>{infoPartita.luogo || '_______________'}</strong>
              </div>
              <div className="header-teams">
                <strong>{squadraBianca.nome || 'Squadra Bianca'}</strong> vs <strong>{squadraNera.nome || 'Squadra Nera'}</strong>
              </div>
            </div>
            <div className="header-right">
              <div className="serie-box">
                <span>SERIE</span>
                <input 
                  type="text" 
                  placeholder="___"
                  maxLength="10"
                />
              </div>
            </div>
          </div>

          {/* NOTIZIE PER LA GIUSTIZIA FEDERALE */}
          <div className="section">
            <label className="section-title">
              Notizie per la Giustizia Federale 
              <span className="section-subtitle">(Regolarità del campo, ritardi, sospensioni, abbigliamento giocatori)</span>
            </label>
            <textarea
              className="large-textarea"
              rows="4"
              value={allegatoSanzioni.notizieGiustizia}
              onChange={(e) => handleChange('notizieGiustizia', e.target.value)}
              placeholder="Inserire eventuali notizie per la Giustizia Federale..."
            />
          </div>

          {/* FORZA PUBBLICA PRESENTE */}
          <div className="section">
            <label className="section-title">Forza Pubblica presente:</label>
            <input
              type="text"
              className="full-width-input"
              value={allegatoSanzioni.forzaPubblica}
              onChange={(e) => handleChange('forzaPubblica', e.target.value)}
              placeholder="Indicare se presente e quale corpo (Polizia, Carabinieri, ecc.)"
            />
          </div>

          {/* COMPORTAMENTO */}
          <div className="section">
            <label className="section-title">Comportamento dei dirigenti, degli atleti e del pubblico:</label>
            <textarea
              className="large-textarea"
              rows="8"
              value={allegatoSanzioni.comportamento}
              onChange={(e) => handleChange('comportamento', e.target.value)}
              placeholder="Descrivere il comportamento tenuto durante l'incontro..."
            />
          </div>

          {/* RIEPILOGO ESPULSIONI DEFINITIVE */}
          <div className="section espulsioni-section">
            <div className="espulsioni-header">
              <div className="espulsioni-title">Riepilogo delle principali espulsioni definitive</div>
              <div className="motivazione-title">Motivazione</div>
            </div>

            {allegatoSanzioni.espulsioni.map((esp, index) => (
              <div key={index} className="espulsione-row">
                <div className="espulsione-articolo">
                  <strong>{esp.articolo}</strong>
                  <span className="espulsione-desc">{esp.descrizione}</span>
                </div>
                <div className="espulsione-inputs">
                  <input
                    type="text"
                    placeholder="Giocatore"
                    value={esp.giocatore}
                    onChange={(e) => handleEspulsioneChange(index, 'giocatore', e.target.value)}
                  />
                  <select
                    value={esp.squadra}
                    onChange={(e) => handleEspulsioneChange(index, 'squadra', e.target.value)}
                  >
                    <option value="">Squadra</option>
                    <option value="B">{squadraBianca.nome || 'Bianca'}</option>
                    <option value="N">{squadraNera.nome || 'Nera'}</option>
                  </select>
                </div>
                <div className="espulsione-motivazione">
                  <input
                    type="text"
                    placeholder="Motivazione dell'espulsione..."
                    value={esp.motivazione}
                    onChange={(e) => handleEspulsioneChange(index, 'motivazione', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* DATA E ARBITRI */}
          <div className="footer-section">
            <div className="footer-data">
              <span>Data: </span>
              <strong>{formatDate(infoPartita.data)}</strong>
            </div>
            <div className="footer-arbitri">
              <span>Arbitro/i: </span>
              <strong>
                {infoPartita.arbitro1?.nome} {infoPartita.arbitro1?.cognome}
                {infoPartita.arbitro2?.nome && ` - ${infoPartita.arbitro2.nome} ${infoPartita.arbitro2.cognome}`}
              </strong>
            </div>
          </div>

          {/* FIRMA */}
          <div className="firma-section">
            <div className="firma-label">Firma Arbitro/i</div>
            <div className="firma-lines">
              <div className="firma-line"></div>
              <div className="firma-line"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AllegatoSanzioni;    