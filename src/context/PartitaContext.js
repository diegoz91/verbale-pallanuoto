import React, { createContext, useContext, useReducer, useEffect } from 'react';
import localforage from 'localforage';

// Stato iniziale
const initialState = {
  // Schermata corrente
  currentScreen: 'info', // 'info', 'squadre', 'partita', 'verbale', 'giocatori'
  viewingTeam: null, // 'B' o 'N' quando si visualizzano i giocatori
  
  // Info partita
  infoPartita: {
    data: '',
    luogo: '',
    oraInizio: '',
    oraTermine: '',
    manifestazione: '',
    arbitro1: { nome: '', cognome: '' },
    arbitro2: { nome: '', cognome: '' },
    segretario: { nome: '', cognome: '' },
    cronometrista: { nome: '', cognome: '' },
    addetto30: { nome: '', cognome: '' },
    giudiciPorta: '',
    note: ''
  },

  // Squadre
  squadraBianca: {
    nome: '',
    colore: 'B',
    giocatori: Array.from({ length: 15 }, (_, i) => ({
      nome: '',
      tesseraFIN: '',
      numero: i + 1,
      reti: { primo: 0, secondo: 0, terzo: 0, quarto: 0 },
      falliPersonali: []
    })),
    timeoutUsati: 0,
    punteggioFinale: 0
  },

  squadraNera: {
    nome: '',
    colore: 'N',
    giocatori: Array.from({ length: 15 }, (_, i) => ({
      nome: '',
      tesseraFIN: '',
      numero: i + 1,
      reti: { primo: 0, secondo: 0, terzo: 0, quarto: 0 },
      falliPersonali: []
    })),
    timeoutUsati: 0,
    punteggioFinale: 0
  },

  // Timer
  timer: {
    tempoCorrente: 1,
    secondiRimanenti: 480,
    attivo: false,
    pronto: true
  },

  // Selezione corrente
  selezione: {
    colore: null,
    numero: null
  },

  // Eventi per tempo
  eventi: {
    primo: [],
    secondo: [],
    terzo: [],
    quarto: []
  },

  // Parziali
  parziali: {
    primo: { bianco: 0, nero: 0 },
    secondo: { bianco: 0, nero: 0 },
    terzo: { bianco: 0, nero: 0 },
    quarto: { bianco: 0, nero: 0 }
  }
};

// Reducer
function partitaReducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload };

    case 'SET_VIEWING_TEAM':
      return { ...state, viewingTeam: action.payload };

    case 'UPDATE_INFO_PARTITA':
      return { 
        ...state, 
        infoPartita: { ...state.infoPartita, ...action.payload }
      };

    case 'UPDATE_SQUADRA_BIANCA':
      return { 
        ...state, 
        squadraBianca: { ...state.squadraBianca, ...action.payload }
      };

    case 'UPDATE_SQUADRA_NERA':
      return { 
        ...state, 
        squadraNera: { ...state.squadraNera, ...action.payload }
      };

    case 'UPDATE_GIOCATORE': {
      const { squadra, index, data } = action.payload;
      const squadraKey = squadra === 'B' ? 'squadraBianca' : 'squadraNera';
      const nuoviGiocatori = [...state[squadraKey].giocatori];
      nuoviGiocatori[index] = { ...nuoviGiocatori[index], ...data };
      return {
        ...state,
        [squadraKey]: { ...state[squadraKey], giocatori: nuoviGiocatori }
      };
    }

    case 'SET_TIMER':
      return { 
        ...state, 
        timer: { ...state.timer, ...action.payload }
      };

    case 'TICK_TIMER':
      return {
        ...state,
        timer: {
          ...state.timer,
          secondiRimanenti: Math.max(0, state.timer.secondiRimanenti - 1)
        }
      };

    case 'SET_SELEZIONE':
      return { 
        ...state, 
        selezione: { ...state.selezione, ...action.payload }
      };

    case 'CLEAR_SELEZIONE':
      return { 
        ...state, 
        selezione: { colore: null, numero: null }
      };

    case 'ADD_EVENTO': {
      const { tempo, evento } = action.payload;
      const tempoKey = ['primo', 'secondo', 'terzo', 'quarto'][tempo - 1];
      return {
        ...state,
        eventi: {
          ...state.eventi,
          [tempoKey]: [...state.eventi[tempoKey], evento]
        }
      };
    }

    case 'UPDATE_PARZIALE': {
      const { tempo, bianco, nero } = action.payload;
      const tempoKey = ['primo', 'secondo', 'terzo', 'quarto'][tempo - 1];
      return {
        ...state,
        parziali: {
          ...state.parziali,
          [tempoKey]: { bianco, nero }
        }
      };
    }

    case 'INCREMENT_PUNTEGGIO': {
      const { squadra, tempo } = action.payload;
      const tempoKey = ['primo', 'secondo', 'terzo', 'quarto'][tempo - 1];
      const campo = squadra === 'B' ? 'bianco' : 'nero';
      return {
        ...state,
        parziali: {
          ...state.parziali,
          [tempoKey]: {
            ...state.parziali[tempoKey],
            [campo]: state.parziali[tempoKey][campo] + 1
          }
        }
      };
    }

    case 'INCREMENT_TIMEOUT': {
      const squadraKey = action.payload === 'B' ? 'squadraBianca' : 'squadraNera';
      return {
        ...state,
        [squadraKey]: {
          ...state[squadraKey],
          timeoutUsati: state[squadraKey].timeoutUsati + 1
        }
      };
    }

    case 'ADD_FALLO_GIOCATORE': {
      const { squadra, numeroGiocatore, fallo } = action.payload;
      const squadraKey = squadra === 'B' ? 'squadraBianca' : 'squadraNera';
      const giocatoreIndex = state[squadraKey].giocatori.findIndex(
        g => g.numero === parseInt(numeroGiocatore)
      );
      if (giocatoreIndex === -1) return state;
      
      const nuoviGiocatori = [...state[squadraKey].giocatori];
      nuoviGiocatori[giocatoreIndex] = {
        ...nuoviGiocatori[giocatoreIndex],
        falliPersonali: [...nuoviGiocatori[giocatoreIndex].falliPersonali, fallo]
      };
      return {
        ...state,
        [squadraKey]: { ...state[squadraKey], giocatori: nuoviGiocatori }
      };
    }

    case 'INCREMENT_RETI_GIOCATORE': {
      const { squadra, numeroGiocatore, tempo } = action.payload;
      const squadraKey = squadra === 'B' ? 'squadraBianca' : 'squadraNera';
      const tempoKey = ['primo', 'secondo', 'terzo', 'quarto'][tempo - 1];
      const giocatoreIndex = state[squadraKey].giocatori.findIndex(
        g => g.numero === parseInt(numeroGiocatore)
      );
      if (giocatoreIndex === -1) return state;
      
      const nuoviGiocatori = [...state[squadraKey].giocatori];
      nuoviGiocatori[giocatoreIndex] = {
        ...nuoviGiocatori[giocatoreIndex],
        reti: {
          ...nuoviGiocatori[giocatoreIndex].reti,
          [tempoKey]: nuoviGiocatori[giocatoreIndex].reti[tempoKey] + 1
        }
      };
      return {
        ...state,
        [squadraKey]: { ...state[squadraKey], giocatori: nuoviGiocatori }
      };
    }

    case 'NEXT_TEMPO':
      return {
        ...state,
        timer: {
          tempoCorrente: Math.min(4, state.timer.tempoCorrente + 1),
          secondiRimanenti: 480,
          attivo: false,
          pronto: true
        }
      };

    case 'RESET_PARTITA':
      return { ...initialState };

    case 'LOAD_STATE':
      return { ...initialState, ...action.payload };

    default:
      return state;
  }
}

// Context
const PartitaContext = createContext();

// Provider
export function PartitaProvider({ children }) {
  const [state, dispatch] = useReducer(partitaReducer, initialState);

  // Carica stato salvato all'avvio
  useEffect(() => {
    localforage.getItem('partitaState').then(savedState => {
      if (savedState) {
        dispatch({ type: 'LOAD_STATE', payload: savedState });
      }
    });
  }, []);

  // Salva stato ad ogni modifica
  useEffect(() => {
    localforage.setItem('partitaState', state);
  }, [state]);

  // Calcola punteggi totali
  const punteggiTotali = {
    bianco: state.parziali.primo.bianco + state.parziali.secondo.bianco + 
            state.parziali.terzo.bianco + state.parziali.quarto.bianco,
    nero: state.parziali.primo.nero + state.parziali.secondo.nero + 
          state.parziali.terzo.nero + state.parziali.quarto.nero
  };

  // Funzione per formattare il tempo
  const formatTempo = () => {
    const minuti = Math.floor(state.timer.secondiRimanenti / 60);
    const secondi = state.timer.secondiRimanenti % 60;
    return `${state.timer.tempoCorrente}T ${String(minuti).padStart(2, '0')}:${String(secondi).padStart(2, '0')}`;
  };

  return (
    <PartitaContext.Provider value={{ 
      state, 
      dispatch, 
      punteggiTotali,
      formatTempo
    }}>
      {children}
    </PartitaContext.Provider>
  );
}

// Hook personalizzato
export function usePartita() {
  const context = useContext(PartitaContext);
  if (!context) {
    throw new Error('usePartita deve essere usato dentro PartitaProvider');
  }
  return context;
}
