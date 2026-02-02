import React from 'react';
import { usePartita } from '../context/PartitaContext';
import { generatePDF } from '../utils/pdfGenerator';
import '../styles/Verbale.css';

function Verbale() {
  const { state, dispatch, punteggiTotali } = usePartita();
  const { infoPartita, squadraBianca, squadraNera, parziali, eventi } = state;

  const handleBack = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'partita' });
  };

  const handleAllegato = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'allegato' });
  };

  const handleExportPDF = async () => {
    try {
      await generatePDF(state, punteggiTotali);
      alert('PDF generato con successo!');
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

  const formatPersona = (persona) => {
    if (!persona.nome && !persona.cognome) return '';
    return `${persona.nome} ${persona.cognome}`.trim();
  };

  // Render tabella giocatori stile Excel
  const renderTabellaGiocatori = (squadra, colore) => {
    const isNero = colore === 'N';
    return (
      <table className={`tabella-giocatori ${isNero ? 'nero' : 'bianco'}`}>
        <thead>
          {/* Header squadra */}
          <tr className="squadra-header-row">
            <th colSpan="3" className="squadra-nome">{squadra.nome || `SQUADRA ${isNero ? 'NERA' : 'BIANCA'}`}</th>
            <th colSpan="2" className="finale-cell">
              <div>Finale</div>
              <div className="finale-value">{isNero ? punteggiTotali.nero : punteggiTotali.bianco}</div>
            </th>
            <th colSpan="2" className="timeout-cell">
              <div>Time Out</div>
              <div>{squadra.timeoutUsati >= 1 ? 'X' : '_'} {squadra.timeoutUsati >= 2 ? 'X' : '_'}</div>
            </th>
            <th colSpan="6" className="calottina-cell">
              <div>Calottina</div>
              <div className={`calottina-badge ${isNero ? 'nero' : 'bianco'}`}>{colore}</div>
            </th>
          </tr>
          {/* Intestazione colonne */}
          <tr className="colonne-header">
            <th className="col-nome">GIOCATORI</th>
            <th className="col-tessera">Tessere FIN</th>
            <th className="col-num">N</th>
            <th className="col-reti" colSpan="4">RETI</th>
            <th className="col-falli" colSpan="6">FALLI PERSONALI</th>
          </tr>
          <tr className="colonne-subheader">
            <th></th>
            <th></th>
            <th></th>
            <th>1°</th>
            <th>2°</th>
            <th>3°</th>
            <th>4°</th>
            <th>Tempo</th>
            <th>Evento</th>
            <th>Tempo</th>
            <th>Evento</th>
            <th>Tempo</th>
            <th>Evento</th>
          </tr>
        </thead>
        <tbody>
          {squadra.giocatori.map((g, i) => (
            <tr key={i} className={g.falliPersonali.length >= 3 ? 'espulso' : ''}>
              <td className="col-nome">{g.nome || ''}</td>
              <td className="col-tessera">{g.tesseraFIN || ''}</td>
              <td className="col-num">{g.numero}</td>
              <td className="col-reti">{g.reti.primo || ''}</td>
              <td className="col-reti">{g.reti.secondo || ''}</td>
              <td className="col-reti">{g.reti.terzo || ''}</td>
              <td className="col-reti">{g.reti.quarto || ''}</td>
              <td className="col-fallo">{g.falliPersonali[0]?.tempo || ''}</td>
              <td className="col-fallo">{g.falliPersonali[0] ? `${g.falliPersonali[0].tipo}` : ''}</td>
              <td className={`col-fallo ${g.falliPersonali.length >= 2 ? 'giallo' : ''}`}>{g.falliPersonali[1]?.tempo || ''}</td>
              <td className={`col-fallo ${g.falliPersonali.length >= 2 ? 'giallo' : ''}`}>{g.falliPersonali[1] ? `${g.falliPersonali[1].tipo}` : ''}</td>
              <td className={`col-fallo ${g.falliPersonali.length >= 3 ? 'rosso' : ''}`}>{g.falliPersonali[2]?.tempo || ''}</td>
              <td className={`col-fallo ${g.falliPersonali.length >= 3 ? 'rosso' : ''}`}>{g.falliPersonali[2] ? `${g.falliPersonali[2].tipo}` : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Render tabella eventi per tempo
  const renderTabellaEventi = (tempoKey, tempoNum) => {
    const eventiTempo = eventi[tempoKey] || [];
    
    return (
      <table className="tabella-eventi">
        <thead>
          <tr>
            <th colSpan="5" className="tempo-header">{tempoNum}° TEMPO</th>
          </tr>
          <tr className="eventi-subheader">
            <th>Tempo</th>
            <th colSpan="2">Calotta</th>
            <th>Evento</th>
            <th>Punteggio</th>
          </tr>
          <tr className="eventi-calotta-header">
            <th></th>
            <th>B</th>
            <th>N</th>
            <th></th>
            <th>B - N</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 29 }, (_, i) => {
            const evento = eventiTempo[i];
            return (
              <tr key={i} className={evento ? `evento-${evento.tipoEvento?.toLowerCase()}` : ''}>
                <td>{evento?.tempo || ''}</td>
                <td className="calotta-b">{evento?.calottaBianco || ''}</td>
                <td className="calotta-n">{evento?.calottaNero || ''}</td>
                <td>{evento?.tipoEvento || ''}</td>
                <td>{evento?.punteggio || ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="verbale-screen">
      {/* Barra azioni */}
      <div className="verbale-actions">
        <button className="btn-back" onClick={handleBack}>← TORNA ALLA PARTITA</button>
        <h2>VERBALE INCONTRO DI PALLANUOTO</h2>
        <div className="actions-right">
          <button className="btn-allegato" onClick={handleAllegato}>📋 ALLEGATO SANZIONI</button>
          <button className="btn-export" onClick={handleExportPDF}>📄 ESPORTA PDF</button>
        </div>
      </div>

      {/* Contenuto verbale scrollabile */}
      <div className="verbale-scroll">
        <div className="verbale-paper">
          
          {/* INTESTAZIONE */}
          <div className="intestazione-grid">
            <div className="titolo-area">
              <span className="numero-verbale">4</span>
              <span className="titolo">VERBALE INCONTRO DI PALLANUOTO</span>
            </div>
            
            <div className="parziali-area">
              <table className="parziali-table">
                <thead>
                  <tr><th colSpan="3">Risultati Parziali</th></tr>
                </thead>
                <tbody>
                  <tr><td>Primo Tempo</td><td>{parziali.primo.bianco}</td><td>{parziali.primo.nero}</td></tr>
                  <tr><td>Secondo Tempo</td><td>{parziali.secondo.bianco}</td><td>{parziali.secondo.nero}</td></tr>
                  <tr><td>Terzo Tempo</td><td>{parziali.terzo.bianco}</td><td>{parziali.terzo.nero}</td></tr>
                  <tr><td>Quarto Tempo</td><td>{parziali.quarto.bianco}</td><td>{parziali.quarto.nero}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="info-area">
              <div className="info-line">Partita del giorno: <strong>{formatDate(infoPartita.data)}</strong></div>
              <div className="info-line">a <strong>{infoPartita.luogo}</strong></div>
              <div className="info-line">inizio <strong>{infoPartita.oraInizio}</strong> termine <strong>{infoPartita.oraTermine}</strong></div>
              <div className="info-line">manifestazione</div>
              <div className="info-line"><strong>{infoPartita.manifestazione}</strong></div>
            </div>

            <div className="ufficiali-area">
              <div className="ufficiale"><span>Arbitro:</span> <strong>{formatPersona(infoPartita.arbitro1)}</strong></div>
              <div className="ufficiale"><span>Arbitro:</span> <strong>{formatPersona(infoPartita.arbitro2)}</strong></div>
              <div className="ufficiale"><span>Segretario:</span> <strong>{formatPersona(infoPartita.segretario)}</strong></div>
              <div className="ufficiale"><span>Crono:</span> <strong>{formatPersona(infoPartita.cronometrista)}</strong></div>
              <div className="ufficiale"><span>30'':</span> <strong>{formatPersona(infoPartita.addetto30)}</strong></div>
            </div>
          </div>

          {/* GIUDICI DI PORTA */}
          <div className="giudici-row">
            <span>Giudici di Porta: </span>
            <strong>{infoPartita.giudiciPorta}</strong>
          </div>

          {/* SQUADRA BIANCA */}
          {renderTabellaGiocatori(squadraBianca, 'B')}

          {/* SQUADRA NERA */}
          {renderTabellaGiocatori(squadraNera, 'N')}

          {/* TABELLE EVENTI - 4 TEMPI affiancate */}
          <div className="eventi-grid">
            {renderTabellaEventi('primo', 1)}
            {renderTabellaEventi('secondo', 2)}
            {renderTabellaEventi('terzo', 3)}
            {renderTabellaEventi('quarto', 4)}
          </div>

          {/* NOTE */}
          <div className="note-row">
            <span>Note: </span>
            <span>{infoPartita.note}</span>
          </div>

          {/* FIRME */}
          <div className="firme-grid">
            <div className="firma-box"><span>Arbitro</span><div className="firma-line"></div></div>
            <div className="firma-box"><span>Arbitro</span><div className="firma-line"></div></div>
            <div className="firma-box"><span>Segretario</span><div className="firma-line"></div></div>
            <div className="firma-box"><span>Crono</span><div className="firma-line"></div></div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Verbale;