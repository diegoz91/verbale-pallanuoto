# 🤽 Verbale Pallanuoto - App per Tablet

App Progressive Web App (PWA) per la gestione dei verbali di pallanuoto, conforme ai regolamenti FIN.

## 📋 Funzionalità

- ✅ **Info Partita**: Data, luogo, orario, manifestazione, arbitri, ufficiali
- ✅ **Gestione Squadre**: 15 giocatori per squadra con tessera FIN
- ✅ **Timer Partita**: Countdown 8 minuti per tempo, 4 tempi
- ✅ **Registrazione Eventi**: Gol, Espulsioni Temporanee (ET), Tiri Rigore (TR), Timeout
- ✅ **Falli Personali**: Max 3 per giocatore con colorazione giallo/rosso
- ✅ **Visualizzazione Verbale**: Layout simile al modulo ufficiale
- ✅ **Export PDF**: Genera PDF pronto per l'invio alla federazione
- ✅ **Funzionamento Offline**: Dati salvati localmente
- ✅ **Installabile**: PWA installabile su tablet come app

---

## 🚀 Installazione e Avvio

### Prerequisiti
- Node.js 18+ (scarica da https://nodejs.org)
- npm (incluso con Node.js)

### Passaggi

1. **Apri VS Code** e apri la cartella del progetto:
   ```
   File > Apri Cartella > seleziona "verbale-pallanuoto"
   ```

2. **Apri il terminale** in VS Code:
   ```
   Terminale > Nuovo Terminale (oppure Ctrl+`)
   ```

3. **Installa le dipendenze**:
   ```bash
   npm install
   ```

4. **Avvia l'app in sviluppo**:
   ```bash
   npm start
   ```

5. **Apri nel browser** (si apre automaticamente):
   ```
   http://localhost:3000
   ```

---

## 📱 Installazione su Tablet

### Per iPad/iOS:
1. Apri Safari e vai all'URL dell'app
2. Tocca l'icona "Condividi" (quadrato con freccia)
3. Scorri e tocca "Aggiungi a Home"
4. Dai un nome all'app e tocca "Aggiungi"

### Per Android:
1. Apri Chrome e vai all'URL dell'app
2. Tocca il menu (3 puntini in alto a destra)
3. Tocca "Installa app" o "Aggiungi a schermata Home"
4. Conferma l'installazione

---

## 🏗️ Build per Produzione

Per creare la versione ottimizzata per produzione:

```bash
npm run build
```

La cartella `build/` conterrà i file pronti per il deploy.

### Deploy su hosting (opzioni gratuite):

**Vercel** (consigliato):
```bash
npm install -g vercel
vercel
```

**Netlify**:
1. Vai su https://netlify.com
2. Trascina la cartella `build/` nella pagina

**GitHub Pages**:
```bash
npm install -g gh-pages
# Aggiungi in package.json: "homepage": "https://tuousername.github.io/verbale-pallanuoto"
npm run build
gh-pages -d build
```

---

## 📁 Struttura Progetto

```
verbale-pallanuoto/
├── public/
│   ├── index.html          # HTML principale
│   └── manifest.json       # Configurazione PWA
├── src/
│   ├── components/
│   │   ├── InfoPartita.js  # Form info partita
│   │   ├── Squadre.js      # Inserimento giocatori
│   │   ├── PartitaLive.js  # Schermata partita live
│   │   ├── Giocatori.js    # Dettaglio giocatori
│   │   └── Verbale.js      # Visualizzazione verbale
│   ├── context/
│   │   └── PartitaContext.js  # Stato globale
│   ├── utils/
│   │   └── pdfGenerator.js # Generazione PDF
│   ├── styles/
│   │   ├── App.css
│   │   ├── InfoPartita.css
│   │   ├── Squadre.css
│   │   ├── PartitaLive.css
│   │   ├── Giocatori.css
│   │   └── Verbale.css
│   ├── App.js              # Componente principale
│   ├── index.js            # Entry point
│   └── serviceWorkerRegistration.js  # Offline support
└── package.json            # Dipendenze
```

---

## 🎮 Come Usare l'App

### 1. Info Partita
Inserisci tutti i dati della partita: data, luogo, arbitri, ecc.

### 2. Squadre
Inserisci i nomi dei giocatori e le tessere FIN per entrambe le squadre.

### 3. Partita Live
- **Timer**: Premi START per avviare il countdown
- **Registra evento**:
  1. Seleziona la squadra (BIANCO/NERO)
  2. Seleziona il numero del giocatore (1-15)
  3. Premi il tipo di evento (GOL, ET, TR)
- **Timeout**: Premi TIMEOUT B o TIMEOUT N

### 4. Verbale
Visualizza il verbale completo e premi "ESPORTA PDF" per scaricarlo.

---

## 🔧 Personalizzazioni

### Cambiare durata tempo
In `src/context/PartitaContext.js`, modifica:
```javascript
secondiRimanenti: 480  // 480 = 8 minuti
```

### Cambiare colori
Modifica i file CSS in `src/styles/`

### Aggiungere campi al verbale
Modifica `src/context/PartitaContext.js` per lo stato e i componenti correlati.

---

## 📄 Licenza

Progetto open source per uso personale e federativo.

---

## 🐛 Problemi Comuni

**L'app non si avvia:**
- Assicurati di aver eseguito `npm install`
- Verifica che Node.js sia installato: `node --version`

**Il PDF non si genera:**
- Controlla che tutti i dati siano inseriti
- Prova a ricaricare la pagina

**I dati non si salvano:**
- I dati sono salvati in LocalStorage
- Svuota la cache se ci sono problemi

---

Sviluppato con ❤️ per la pallanuoto italiana
