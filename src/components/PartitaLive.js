import React, { useEffect, useRef, useCallback } from "react";
import { usePartita } from "../context/PartitaContext";
import "../styles/PartitaLive.css";

function PartitaLive() {
  const { state, dispatch, punteggiTotali, formatTempo } = usePartita();
  const { timer, timer28, selezione, squadraBianca, squadraNera, parziali } =
    state;
  const timerRef = useRef(null);
  const timer28Ref = useRef(null);

  // Gestione timer principale
  const startTimer = useCallback(() => {
    if (timer.pronto && !timer.attivo) {
      dispatch({ type: "SET_TIMER", payload: { attivo: true, pronto: false } });
      dispatch({ type: "SET_TIMER_28", payload: { attivo: true } });
    }
  }, [timer.pronto, timer.attivo, dispatch]);

  const pauseTimer = useCallback(() => {
    dispatch({ type: "SET_TIMER", payload: { attivo: false } });
    dispatch({ type: "SET_TIMER_28", payload: { attivo: false } });
  }, [dispatch]);

  const resumeTimer = useCallback(() => {
    if (!timer.attivo && timer.secondiRimanenti > 0) {
      dispatch({ type: "SET_TIMER", payload: { attivo: true } });
      dispatch({ type: "SET_TIMER_28", payload: { attivo: true } });
    }
  }, [timer.attivo, timer.secondiRimanenti, dispatch]);

  const resetTimer = useCallback(() => {
    dispatch({
      type: "SET_TIMER",
      payload: { secondiRimanenti: 480, attivo: false, pronto: true },
    });
    dispatch({ type: "RESET_TIMER_28", payload: 28 });
  }, [dispatch]);

  // Modifica tempo manualmente
  const modificaTempo = (secondiDelta) => {
    if (timer.attivo) return;
    const nuovoTempo = Math.max(
      0,
      Math.min(599, timer.secondiRimanenti + secondiDelta),
    );
    dispatch({
      type: "SET_TIMER",
      payload: { secondiRimanenti: nuovoTempo, pronto: false },
    });
  };

  // Cambia tempo di gioco (1°, 2°, 3°, 4°)
  const cambiaTempo = (nuovoTempo) => {
    if (timer.attivo) return;
    dispatch({ type: "SET_TIMER", payload: { tempoCorrente: nuovoTempo } });
  };

  // Reset timer 28 secondi
  const resetTimer28 = (secondi) => {
    dispatch({ type: "RESET_TIMER_28", payload: secondi });
  };

  // Effect per il countdown principale
  useEffect(() => {
    if (timer.attivo && timer.secondiRimanenti > 0) {
      timerRef.current = setInterval(() => {
        dispatch({ type: "TICK_TIMER" });
      }, 1000);
    } else if (timer.secondiRimanenti === 0 && timer.attivo) {
      dispatch({ type: "SET_TIMER", payload: { attivo: false } });
      dispatch({ type: "SET_TIMER_28", payload: { attivo: false } });
      handleFineTempo();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.attivo, timer.secondiRimanenti]);

  // Effect per il countdown 28 secondi
  useEffect(() => {
    if (timer28 && timer28.attivo && timer28.secondiRimanenti > 0) {
      timer28Ref.current = setInterval(() => {
        dispatch({ type: "TICK_TIMER_28" });
      }, 1000);
    }

    return () => {
      if (timer28Ref.current) {
        clearInterval(timer28Ref.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer28?.attivo, timer28?.secondiRimanenti]);

  const handleFineTempo = () => {
    const tempoKey = ["primo", "secondo", "terzo", "quarto"][
      timer.tempoCorrente - 1
    ];
    alert(
      `Fine ${timer.tempoCorrente}° Tempo!\n\nParziale: ${parziali[tempoKey].bianco} - ${parziali[tempoKey].nero}\nTotale: ${punteggiTotali.bianco} - ${punteggiTotali.nero}`,
    );

    if (timer.tempoCorrente < 4) {
      dispatch({ type: "NEXT_TEMPO" });
    } else {
      alert(
        `FINE PARTITA!\n\nRisultato Finale: ${punteggiTotali.bianco} - ${punteggiTotali.nero}`,
      );
    }
  };

  // Selezione colore
  const selectColore = (colore) => {
    dispatch({ type: "SET_SELEZIONE", payload: { colore } });
  };

  // Selezione numero
  const selectNumero = (numero) => {
    dispatch({ type: "SET_SELEZIONE", payload: { numero } });
  };

  // Registra GOL
  const registraGol = () => {
    if (!selezione.colore || !selezione.numero) {
      alert("Seleziona prima squadra e numero giocatore!");
      return;
    }

    const tempo = formatTempo();
    const evento = {
      tempo,
      calottaBianco:
        selezione.colore === "B" ? selezione.numero.toString() : null,
      calottaNero:
        selezione.colore === "N" ? selezione.numero.toString() : null,
      tipoEvento: "Gol",
      punteggio: `${punteggiTotali.bianco + (selezione.colore === "B" ? 1 : 0)} - ${punteggiTotali.nero + (selezione.colore === "N" ? 1 : 0)}`,
    };

    dispatch({
      type: "ADD_EVENTO",
      payload: { tempo: timer.tempoCorrente, evento },
    });
    dispatch({
      type: "INCREMENT_PUNTEGGIO",
      payload: { squadra: selezione.colore, tempo: timer.tempoCorrente },
    });
    dispatch({
      type: "INCREMENT_RETI_GIOCATORE",
      payload: {
        squadra: selezione.colore,
        numeroGiocatore: selezione.numero,
        tempo: timer.tempoCorrente,
      },
    });
    dispatch({ type: "CLEAR_SELEZIONE" });

    // Reset timer 28 dopo gol
    resetTimer28(28);
  };

  // Registra ET (Espulsione Temporanea)
  const registraET = () => {
    if (!selezione.colore || !selezione.numero) {
      alert("Seleziona prima squadra e numero giocatore!");
      return;
    }

    const squadra = selezione.colore === "B" ? squadraBianca : squadraNera;
    const giocatore = squadra.giocatori.find(
      (g) => g.numero === selezione.numero,
    );

    if (giocatore && giocatore.falliPersonali.length >= 3) {
      alert("Il giocatore ha già raggiunto il massimo di 3 falli!");
      return;
    }

    const tempo = formatTempo();
    const livello = giocatore ? giocatore.falliPersonali.length + 1 : 1;

    const fallo = { tempo, tipo: "ET", livello };
    dispatch({
      type: "ADD_FALLO_GIOCATORE",
      payload: {
        squadra: selezione.colore,
        numeroGiocatore: selezione.numero,
        fallo,
      },
    });

    const evento = {
      tempo,
      calottaBianco:
        selezione.colore === "B" ? selezione.numero.toString() : null,
      calottaNero:
        selezione.colore === "N" ? selezione.numero.toString() : null,
      tipoEvento: "ET",
      punteggio: "",
    };
    dispatch({
      type: "ADD_EVENTO",
      payload: { tempo: timer.tempoCorrente, evento },
    });
    dispatch({ type: "CLEAR_SELEZIONE" });

    if (livello === 3) {
      alert(
        `Attenzione: Giocatore ${selezione.numero} ESPULSO DEFINITIVAMENTE!`,
      );
    }
  };

  // Registra TR (Tiro Rigore)
  const registraTR = () => {
    if (!selezione.colore || !selezione.numero) {
      alert("Seleziona prima squadra e numero giocatore!");
      return;
    }

    const tempo = formatTempo();
    const squadra = selezione.colore === "B" ? squadraBianca : squadraNera;
    const giocatore = squadra.giocatori.find(
      (g) => g.numero === selezione.numero,
    );
    const livello = giocatore ? giocatore.falliPersonali.length + 1 : 1;

    const fallo = { tempo, tipo: "TR", livello };
    dispatch({
      type: "ADD_FALLO_GIOCATORE",
      payload: {
        squadra: selezione.colore,
        numeroGiocatore: selezione.numero,
        fallo,
      },
    });

    const evento = {
      tempo,
      calottaBianco:
        selezione.colore === "B" ? selezione.numero.toString() : null,
      calottaNero:
        selezione.colore === "N" ? selezione.numero.toString() : null,
      tipoEvento: "TR",
      punteggio: "",
    };
    dispatch({
      type: "ADD_EVENTO",
      payload: { tempo: timer.tempoCorrente, evento },
    });
    dispatch({ type: "CLEAR_SELEZIONE" });
  };

  // Timeout
  const registraTimeout = (squadra) => {
    const squadraObj = squadra === "B" ? squadraBianca : squadraNera;
    if (squadraObj.timeoutUsati >= 2) {
      alert("Timeout esauriti per questa squadra!");
      return;
    }

    dispatch({ type: "INCREMENT_TIMEOUT", payload: squadra });

    const tempo = formatTempo();
    const evento = {
      tempo,
      calottaBianco: squadra === "B" ? "TO" : null,
      calottaNero: squadra === "N" ? "TO" : null,
      tipoEvento: "Timeout",
      punteggio: "",
    };
    dispatch({
      type: "ADD_EVENTO",
      payload: { tempo: timer.tempoCorrente, evento },
    });
  };

  // Navigazione
  const goToVerbale = () =>
    dispatch({ type: "SET_SCREEN", payload: "verbale" });
  const goToGiocatori = (team) => {
    dispatch({ type: "SET_VIEWING_TEAM", payload: team });
    dispatch({ type: "SET_SCREEN", payload: "giocatori" });
  };

  const handleReset = () => {
    if (window.confirm("Sei sicuro di voler resettare tutta la partita?")) {
      dispatch({ type: "RESET_PARTITA" });
    }
  };

  // Imposta ora fine partita
  const handleFinePartita = () => {
    const now = new Date();
    const oraTermine = now.toTimeString().slice(0, 5);
    dispatch({
      type: "UPDATE_INFO_PARTITA",
      payload: { oraTermine },
    });
    alert(`Ora termine impostata: ${oraTermine}`);
  };

  // Vai a gestione eventi per correggere errori
  const goToGestioneEventi = () => {
    dispatch({ type: "SET_SCREEN", payload: "gestione-eventi" });
  };

  // Formatta minuti e secondi separatamente
  const minuti = Math.floor(timer.secondiRimanenti / 60);
  const secondi = timer.secondiRimanenti % 60;

  // Timer 28 secondi (con fallback se non esiste ancora)
  const secondi28 = timer28 ? timer28.secondiRimanenti : 28;

  return (
    <div className="partita-screen">
      {/* Header con punteggio e timer 28 */}
      <div className="score-header">
        <div className="team-score bianco">
          <span className="team-name">{squadraBianca.nome || "BIANCO"}</span>
          <span className="score">{punteggiTotali.bianco}</span>
          <span className="timeout-indicator">
            TO: {squadraBianca.timeoutUsati > 0 ? "X" : "_"}{" "}
            {squadraBianca.timeoutUsati > 1 ? "X" : "_"}
          </span>
        </div>

<div className="timer-container">
  {/* Timer 28 secondi */}
  <div className="timer28-section">
    <span className="timer28-label">Possesso</span>
    <div className={`timer28-display ${secondi28 <= 5 ? 'warning' : ''} ${secondi28 === 0 ? 'expired' : ''}`}>
      {secondi28}
    </div>
    <div className="timer28-buttons">
      <button className="btn-timer28" onClick={() => resetTimer28(28)}>28</button>
      <button className="btn-timer28" onClick={() => resetTimer28(18)}>18</button>
    </div>
  </div>

  {/* Separatore */}
  <div className="timer-divider"></div>

  {/* Timer principale */}
  <div className="timer-main-section">
    <div className="tempo-selector">
      {[1, 2, 3, 4].map(t => (
        <button
          key={t}
          className={`btn-tempo ${timer.tempoCorrente === t ? 'active' : ''}`}
          onClick={() => cambiaTempo(t)}
          disabled={timer.attivo}
        >
          {t}°
        </button>
      ))}
    </div>

    <div className="timer-edit">
      <div className="timer-unit">
        <button className="btn-adjust" onClick={() => modificaTempo(60)} disabled={timer.attivo}>+</button>
        <span className="timer-value">{String(minuti).padStart(2, '0')}</span>
        <button className="btn-adjust" onClick={() => modificaTempo(-60)} disabled={timer.attivo}>-</button>
      </div>
      <span className="timer-separator">:</span>
      <div className="timer-unit">
        <button className="btn-adjust" onClick={() => modificaTempo(1)} disabled={timer.attivo}>+</button>
        <span className="timer-value">{String(secondi).padStart(2, '0')}</span>
        <button className="btn-adjust" onClick={() => modificaTempo(-1)} disabled={timer.attivo}>-</button>
      </div>
    </div>
  </div>

  {/* Separatore */}
  <div className="timer-divider"></div>

  {/* Bottoni START/RESET a destra */}
  <div className="timer-controls-section">
    {timer.pronto && !timer.attivo && (
      <button className="btn-timer-big start" onClick={startTimer}>▶<br/>START</button>
    )}
    {timer.attivo && (
      <button className="btn-timer-big pause" onClick={pauseTimer}>⏸<br/>PAUSA</button>
    )}
    {!timer.attivo && !timer.pronto && timer.secondiRimanenti > 0 && (
      <button className="btn-timer-big resume" onClick={resumeTimer}>▶<br/>RIPRENDI</button>
    )}
    <button className="btn-timer-big reset" onClick={resetTimer}>↺<br/>RESET</button>
  </div>
</div>

        <div className="team-score nero">
          <span className="team-name">{squadraNera.nome || "NERO"}</span>
          <span className="score">{punteggiTotali.nero}</span>
          <span className="timeout-indicator">
            TO: {squadraNera.timeoutUsati > 0 ? "X" : "_"}{" "}
            {squadraNera.timeoutUsati > 1 ? "X" : "_"}
          </span>
        </div>
      </div>

      {/* Area centrale */}
      <div className="main-area">
        {/* Selezione squadra */}
        <div className="selection-area">
          <h3>SQUADRA</h3>
          <div className="team-buttons">
            <button
              className={`btn-team bianco ${selezione.colore === "B" ? "selected" : ""}`}
              onClick={() => selectColore("B")}
            >
              BIANCO
            </button>
            <button
              className={`btn-team nero ${selezione.colore === "N" ? "selected" : ""}`}
              onClick={() => selectColore("N")}
            >
              NERO
            </button>
          </div>
        </div>

        {/* Selezione numero */}
        <div className="number-area">
          <h3>NUMERO GIOCATORE</h3>
          <div className="number-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((num) => (
              <button
                key={num}
                className={`btn-number ${selezione.numero === num ? "selected" : ""}`}
                onClick={() => selectNumero(num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Pulsanti eventi */}
        <div className="events-area">
          <h3>EVENTI</h3>
          <div className="event-buttons">
            <button className="btn-event gol" onClick={registraGol}>
              ⚽ GOL
            </button>
            <button className="btn-event et" onClick={registraET}>
              🟨 ET
            </button>
            <button className="btn-event tr" onClick={registraTR}>
              🎯 TR
            </button>
          </div>
          <div className="timeout-buttons">
            <button
              className="btn-timeout bianco"
              onClick={() => registraTimeout("B")}
            >
              ⏱ TIMEOUT B
            </button>
            <button
              className="btn-timeout nero"
              onClick={() => registraTimeout("N")}
            >
              ⏱ TIMEOUT N
            </button>
          </div>
        </div>
      </div>

      {/* Selezione corrente */}
      {(selezione.colore || selezione.numero) && (
        <div className="current-selection">
          Selezionato:{" "}
          {selezione.colore === "B"
            ? "BIANCO"
            : selezione.colore === "N"
              ? "NERO"
              : "?"}
          {" - N° "}
          {selezione.numero || "?"}
          <button
            className="btn-clear"
            onClick={() => dispatch({ type: "CLEAR_SELEZIONE" })}
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigazione */}
      <div className="nav-footer">
        <button
          className="btn-nav fullscreen"
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              document.documentElement.requestFullscreen();
            }
          }}
        >
          ⛶ FULL
        </button>
        <button className="btn-nav fine-partita" onClick={handleFinePartita}>
          🏁 FINE
        </button>
        <button className="btn-nav correggi" onClick={goToGestioneEventi}>
          ✏️ CORREGGI
        </button>
        <button className="btn-nav" onClick={goToVerbale}>
          📄 VERBALE
        </button>
        <button className="btn-nav" onClick={() => goToGiocatori("B")}>
          👥 B
        </button>
        <button className="btn-nav" onClick={() => goToGiocatori("N")}>
          👥 N
        </button>
        <button className="btn-nav danger" onClick={handleReset}>
          🔄
        </button>
      </div>
    </div>
  );
}

export default PartitaLive;
