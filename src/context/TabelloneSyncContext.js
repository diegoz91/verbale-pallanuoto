import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { usePartita } from './PartitaContext';
import localforage from 'localforage';

const RECONNECT_DELAY = 3000;
const STORAGE_KEY = 'tabellone_ip';
const DEFAULT_HOTSPOT_IP = '192.168.4.1';
const AUTO_CONNECT_TIMEOUT = 3000; // 3 secondi per tentativo auto

const TabelloneSyncContext = createContext();

export function TabelloneSyncProvider({ children }) {
  const { dispatch } = usePartita();
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const manualDisconnectRef = useRef(false);
  const autoConnectDoneRef = useRef(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [tabelloneIP, setTabelloneIP] = useState('');
  const [autoConnecting, setAutoConnecting] = useState(true);

  // Auto-connect on mount: try default hotspot IP
  useEffect(() => {
    if (autoConnectDoneRef.current) return;
    autoConnectDoneRef.current = true;

    setAutoConnecting(true);

    // Try to reach the tabellone - start with current host since
    // the Verbale is served from the Raspberry Pi itself
    const tryAutoConnect = async () => {
      const ipsToTry = [];
      
      // First try: the host serving this page (most likely the Pi)
      const currentHost = window.location.hostname;
      if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
        ipsToTry.push(currentHost);
      }

      // Second try: default hotspot IP
      if (!ipsToTry.includes(DEFAULT_HOTSPOT_IP)) {
        ipsToTry.push(DEFAULT_HOTSPOT_IP);
      }
      
      // Third try: saved IP if different
      const savedIP = await localforage.getItem(STORAGE_KEY);
      if (savedIP && !ipsToTry.includes(savedIP)) {
        ipsToTry.push(savedIP);
      }

      for (const ip of ipsToTry) {
        try {
          // Quick check: try to open WebSocket with timeout
          const found = await testConnection(ip);
          if (found) {
            setTabelloneIP(ip);
            setAutoConnecting(false);
            connect(ip);
            return;
          }
        } catch (e) {
          // IP not reachable, try next
        }
      }

      // No tabellone found, show manual input
      setAutoConnecting(false);
      if (savedIP) setTabelloneIP(savedIP);
    };

    tryAutoConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quick test if tabellone is reachable
  const testConnection = (ip) => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        ws.close();
        resolve(false);
      }, AUTO_CONNECT_TIMEOUT);

      const ws = new WebSocket(`ws://${ip}:8080/ws/verbale`);
      
      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve(true);
      };
      
      ws.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
    });
  };

  // Send message to tabellone
  const sendAction = useCallback((action, payload = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action, payload }));
      return true;
    }
    return false;
  }, []);

  // Connect to tabellone
  const connect = useCallback((ip) => {
    if (!ip) return;
    
    manualDisconnectRef.current = false;

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }

    setConnecting(true);
    const wsUrl = `ws://${ip}:8080/ws/verbale`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('[Tabellone] Connesso a', ip);
        setConnected(true);
        setConnecting(false);
        setTabelloneIP(ip);
        localforage.setItem(STORAGE_KEY, ip);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === 'state') {
            const gs = msg.data;
            
            // Sync timer from tabellone (tabellone è il MASTER del cronometro)
            dispatch({
              type: 'SYNC_FROM_TABELLONE',
              payload: {
                timer: {
                  tempoCorrente: gs.period,
                  secondiRimanenti: gs.timer.total_seconds,
                  attivo: gs.timer.running,
                  pronto: !gs.timer.running && gs.timer.total_seconds === gs.period_duration * 60
                },
                timer28: {
                  secondiRimanenti: gs.possession.total_seconds,
                  attivo: gs.possession.running
                }
              }
            });
          }
        } catch (e) {
          console.error('[Tabellone] Errore parsing:', e);
        }
      };

      ws.onclose = () => {
        console.log('[Tabellone] Disconnesso');
        setConnected(false);
        setConnecting(false);
        wsRef.current = null;
        
        // Auto-reconnect only if not manually disconnected
        if (!manualDisconnectRef.current) {
          reconnectRef.current = setTimeout(() => {
            connect(ip);
          }, RECONNECT_DELAY);
        }
      };

      ws.onerror = () => {
        setConnecting(false);
      };

      wsRef.current = ws;
    } catch (e) {
      console.error('[Tabellone] Errore:', e);
      setConnecting(false);
    }
  }, [dispatch]);

  // Disconnect
  const disconnect = useCallback(() => {
    manualDisconnectRef.current = true;
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
    setConnecting(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // === HIGH-LEVEL SYNC FUNCTIONS ===

  // Send player roster to tabellone
  const syncPlayers = useCallback((squadra, colore) => {
    const team = colore === 'B' ? 'teamA' : 'teamB';
    
    if (squadra.nome) {
      sendAction('verbale_set_team_name', { team, name: squadra.nome });
    }
    
    const players = squadra.giocatori
      .filter(g => g.nome && g.nome.trim())
      .map(g => ({ number: g.numero, name: g.nome }));
    
    sendAction('verbale_sync_players', { team, players });
  }, [sendAction]);

  // Send ET to tabellone
  const syncET = useCallback((colore, numeroGiocatore) => {
    const team = colore === 'B' ? 'teamA' : 'teamB';
    sendAction('player_foul_add', { team, number: parseInt(numeroGiocatore) });
  }, [sendAction]);

  // Send TR to tabellone
  const syncTR = useCallback((colore, numeroGiocatore) => {
    const team = colore === 'B' ? 'teamA' : 'teamB';
    sendAction('player_foul_add', { team, number: parseInt(numeroGiocatore) });
  }, [sendAction]);

  // Send Timeout to tabellone
  const syncTimeout = useCallback((colore) => {
    const team = colore === 'B' ? 'teamA' : 'teamB';
    sendAction('timeout_call', { team });
  }, [sendAction]);

  return (
    <TabelloneSyncContext.Provider value={{
      connected,
      connecting,
      autoConnecting,
      tabelloneIP,
      setTabelloneIP,
      connect,
      disconnect,
      sendAction,
      syncPlayers,
      syncET,
      syncTR,
      syncTimeout
    }}>
      {children}
    </TabelloneSyncContext.Provider>
  );
}

export function useTabellone() {
  const context = useContext(TabelloneSyncContext);
  if (!context) {
    throw new Error('useTabellone deve essere usato dentro TabelloneSyncProvider');
  }
  return context;
}