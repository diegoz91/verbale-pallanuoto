import jsPDF from 'jspdf';
import 'jspdf-autotable';

export async function generatePDF(state, punteggiTotali) {
  const { infoPartita, squadraBianca, squadraNera, parziali, eventi } = state;
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 10;

  // Helper functions
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT');
  };

  const formatPersona = (p) => {
    if (!p) return '';
    return p.nome || p.cognome ? `${p.nome || ''} ${p.cognome || ''}`.trim() : '';
  };

  // =====================
  // PAGINA 1: INTESTAZIONE + SQUADRA BIANCA
  // =====================
  let y = margin;
  
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.setTextColor(0, 0, 0);

  // === INTESTAZIONE ===
  doc.rect(margin, y, pageWidth - 2*margin, 38);
  
  // Colonna 1: Titolo (0-95mm)
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('4', margin + 8, y + 24);
  doc.setFontSize(12);
  doc.text('VERBALE INCONTRO', margin + 25, y + 18);
  doc.text('DI PALLANUOTO', margin + 25, y + 26);
  
  doc.line(margin + 95, y, margin + 95, y + 38);
  
  // Colonna 2: Parziali (95-160mm)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Risultati Parziali', margin + 100, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  doc.text('Primo Tempo', margin + 100, y + 15);
  doc.text(String(parziali.primo.bianco), margin + 140, y + 15);
  doc.text(String(parziali.primo.nero), margin + 150, y + 15);
  
  doc.text('Secondo Tempo', margin + 100, y + 21);
  doc.text(String(parziali.secondo.bianco), margin + 140, y + 21);
  doc.text(String(parziali.secondo.nero), margin + 150, y + 21);
  
  doc.text('Terzo Tempo', margin + 100, y + 27);
  doc.text(String(parziali.terzo.bianco), margin + 140, y + 27);
  doc.text(String(parziali.terzo.nero), margin + 150, y + 27);
  
  doc.text('Quarto Tempo', margin + 100, y + 33);
  doc.text(String(parziali.quarto.bianco), margin + 140, y + 33);
  doc.text(String(parziali.quarto.nero), margin + 150, y + 33);
  
  doc.line(margin + 160, y, margin + 160, y + 38);
  
  // Colonna 3: Info partita (160-220mm)
  doc.setFontSize(8);
  doc.text('Partita del giorno:', margin + 165, y + 10);
  doc.text(formatDate(infoPartita.data), margin + 200, y + 10);
  doc.text('a', margin + 165, y + 16);
  doc.text((infoPartita.luogo || '').substring(0, 25), margin + 172, y + 16);
  doc.text('inizio', margin + 165, y + 22);
  doc.text(infoPartita.oraInizio || '', margin + 182, y + 22);
  doc.text('termine', margin + 198, y + 22);
  doc.text(infoPartita.oraTermine || '', margin + 215, y + 22);
  
  doc.line(margin + 160, y + 25, margin + 220, y + 25);
  
  doc.text('manifestazione:', margin + 165, y + 31);
  doc.setFont('helvetica', 'bold');
  doc.text((infoPartita.manifestazione || '').substring(0, 22), margin + 165, y + 36);
  doc.setFont('helvetica', 'normal');
  
  doc.line(margin + 220, y, margin + 220, y + 38);
  
  // Colonna 4: Ufficiali (220-fine)
  doc.setFontSize(8);
  doc.text('Arbitro:', margin + 225, y + 8);
  doc.text(formatPersona(infoPartita.arbitro1).substring(0, 18), margin + 248, y + 8);
  doc.text('Arbitro:', margin + 225, y + 14);
  doc.text(formatPersona(infoPartita.arbitro2).substring(0, 18), margin + 248, y + 14);
  doc.text('Segretario:', margin + 225, y + 20);
  doc.text(formatPersona(infoPartita.segretario).substring(0, 16), margin + 252, y + 20);
  doc.text('Crono:', margin + 225, y + 26);
  doc.text(formatPersona(infoPartita.cronometrista).substring(0, 18), margin + 248, y + 26);
  doc.text('30":', margin + 225, y + 32);
  doc.text(formatPersona(infoPartita.addetto30).substring(0, 20), margin + 240, y + 32);
  
  y += 42;

  // === GIUDICI DI PORTA ===
  doc.rect(margin, y, pageWidth - 2*margin, 8);
  doc.setFontSize(9);
  doc.text('Giudici di Porta:', margin + 3, y + 5.5);
  doc.text((infoPartita.giudiciPorta || '').substring(0, 90), margin + 38, y + 5.5);
  
  y += 12;

  // === FUNZIONE RENDER SQUADRA ===
  const renderSquadra = (squadra, colore, startY) => {
    const isNero = colore === 'N';
    const nomeSquadra = squadra.nome || (isNero ? 'SQUADRA NERA' : 'SQUADRA BIANCA');
    const punteggio = isNero ? punteggiTotali.nero : punteggiTotali.bianco;
    const to1 = squadra.timeoutUsati >= 1 ? 'X' : '-';
    const to2 = squadra.timeoutUsati >= 2 ? 'X' : '-';
    
    // Header squadra
    if (isNero) {
      doc.setFillColor(55, 65, 81);
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setFillColor(230, 230, 230);
      doc.setTextColor(0, 0, 0);
    }
    
    doc.rect(margin, startY, pageWidth - 2*margin, 12, 'F');
    doc.rect(margin, startY, pageWidth - 2*margin, 12);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(nomeSquadra.substring(0, 35), margin + 5, startY + 8);
    
    // Finale
    doc.setFontSize(9);
    doc.text('Finale', margin + 130, startY + 4);
    doc.setFontSize(18);
    doc.text(String(punteggio), margin + 138, startY + 10);
    
    // Timeout
    doc.setFontSize(9);
    doc.text('Time Out', margin + 170, startY + 4);
    doc.setFontSize(14);
    doc.text(to1 + '   ' + to2, margin + 175, startY + 10);
    
    // Calottina
    doc.setFontSize(9);
    doc.text('Calottina', margin + 215, startY + 4);
    doc.setFontSize(16);
    doc.text(colore, margin + 225, startY + 10);
    
    doc.setTextColor(0, 0, 0);
    
    // Tabella giocatori
    const rows = squadra.giocatori.map(g => [
      (g.nome || '').substring(0, 20),
      g.tesseraFIN || '',
      g.numero || '',
      g.reti.primo || '',
      g.reti.secondo || '',
      g.reti.terzo || '',
      g.reti.quarto || '',
      g.falliPersonali[0]?.tempo || '',
      g.falliPersonali[0]?.tipo || '',
      g.falliPersonali[1]?.tempo || '',
      g.falliPersonali[1]?.tipo || '',
      g.falliPersonali[2]?.tempo || '',
      g.falliPersonali[2]?.tipo || ''
    ]);

    doc.autoTable({
      startY: startY + 12,
      margin: { left: margin, right: margin },
      head: [
        [
          { content: 'GIOCATORI', styles: { halign: 'left' } },
          'Tessere FIN',
          'N',
          { content: 'RETI', colSpan: 4 },
          { content: 'FALLI PERSONALI', colSpan: 6 }
        ],
        ['', '', '', '1°', '2°', '3°', '4°', 'Tempo', 'Ev', 'Tempo', 'Ev', 'Tempo', 'Ev']
      ],
      body: rows,
      styles: {
        fontSize: 8,
        cellPadding: 1.5,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        textColor: [0, 0, 0],
        halign: 'center'
      },
      headStyles: {
        fillColor: isNero ? [75, 85, 99] : [220, 220, 220],
        textColor: isNero ? [255, 255, 255] : [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 42, halign: 'left' },
        1: { cellWidth: 26, halign: 'center' },
        2: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 12, halign: 'center' },
        5: { cellWidth: 12, halign: 'center' },
        6: { cellWidth: 12, halign: 'center' },
        7: { cellWidth: 22, halign: 'center' },
        8: { cellWidth: 14, halign: 'center' },
        9: { cellWidth: 22, halign: 'center' },
        10: { cellWidth: 14, halign: 'center' },
        11: { cellWidth: 22, halign: 'center' },
        12: { cellWidth: 14, halign: 'center' }
      },
      didParseCell: function(data) {
        if (data.section === 'body') {
          const g = squadra.giocatori[data.row.index];
          if (g) {
            if ((data.column.index === 9 || data.column.index === 10) && g.falliPersonali.length >= 2) {
              data.cell.styles.fillColor = [254, 243, 199];
            }
            if ((data.column.index === 11 || data.column.index === 12) && g.falliPersonali.length >= 3) {
              data.cell.styles.fillColor = [254, 226, 226];
            }
          }
        }
      }
    });

    return doc.lastAutoTable.finalY;
  };

  // Render Squadra Bianca
  renderSquadra(squadraBianca, 'B', y);

  // Footer pagina 1
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Pagina 1/3', pageWidth - margin, pageHeight - 5, { align: 'right' });

  // =====================
  // PAGINA 2: SQUADRA NERA
  // =====================
  doc.addPage();
  y = margin;
  
  doc.setTextColor(0, 0, 0);
  
  // Render Squadra Nera
  renderSquadra(squadraNera, 'N', y);

  // Footer pagina 2
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Pagina 2/3', pageWidth - margin, pageHeight - 5, { align: 'right' });

  // =====================
  // PAGINA 3: EVENTI + NOTE + FIRME
  // =====================
  doc.addPage();
  y = margin;
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EVENTI DELLA PARTITA', pageWidth / 2, y + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  
  y += 14;

  // === TABELLE EVENTI ===
  const eventiWidth = (pageWidth - 2*margin - 18) / 4;
  const tempiNomi = ['primo', 'secondo', 'terzo', 'quarto'];
  const tempiLabel = ['1° TEMPO', '2° TEMPO', '3° TEMPO', '4° TEMPO'];

  tempiNomi.forEach((tempo, idx) => {
    const startX = margin + idx * (eventiWidth + 6);
    const eventiTempo = eventi[tempo] || [];
    
    const rows = [];
    for (let i = 0; i < 18; i++) {
      const e = eventiTempo[i];
      rows.push([
        e?.tempo || '',
        e?.calottaBianco || '',
        e?.calottaNero || '',
        e?.tipoEvento || '',
        e?.punteggio || ''
      ]);
    }

    doc.autoTable({
      startY: y,
      margin: { left: startX },
      tableWidth: eventiWidth,
      head: [
        [{ content: tempiLabel[idx], colSpan: 5, styles: { fillColor: [26, 86, 219], textColor: [255, 255, 255], halign: 'center', fontStyle: 'bold' } }],
        ['Tempo', 'B', 'N', 'Evento', 'Punt.']
      ],
      body: rows,
      styles: {
        fontSize: 7,
        cellPadding: 1.2,
        lineColor: [0, 0, 0],
        lineWidth: 0.15,
        textColor: [0, 0, 0],
        halign: 'center'
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: eventiWidth * 0.26 },
        1: { cellWidth: eventiWidth * 0.12 },
        2: { cellWidth: eventiWidth * 0.12 },
        3: { cellWidth: eventiWidth * 0.22 },
        4: { cellWidth: eventiWidth * 0.28 }
      },
      didParseCell: function(data) {
        if (data.section === 'body') {
          const e = eventiTempo[data.row.index];
          if (e) {
            if (e.tipoEvento === 'Gol') data.cell.styles.fillColor = [209, 250, 229];
            if (e.tipoEvento === 'ET') data.cell.styles.fillColor = [254, 243, 199];
            if (e.tipoEvento === 'TR') data.cell.styles.fillColor = [254, 226, 226];
            if (e.tipoEvento === 'Timeout') data.cell.styles.fillColor = [229, 231, 235];
          }
        }
      }
    });
  });

  // === NOTE ===
  const noteY = pageHeight - 38;
  doc.rect(margin, noteY, pageWidth - 2*margin, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Note:', margin + 3, noteY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text((infoPartita.note || '').substring(0, 150), margin + 18, noteY + 7);

  // === FIRME ===
  const firmeY = pageHeight - 20;
  const firmaWidth = (pageWidth - 2*margin - 45) / 4;
  const firme = ['Arbitro', 'Arbitro', 'Segretario', 'Crono'];
  
  firme.forEach((label, idx) => {
    const x = margin + idx * (firmaWidth + 15);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(label, x + firmaWidth / 2, firmeY, { align: 'center' });
    doc.line(x, firmeY + 10, x + firmaWidth, firmeY + 10);
  });

  // Footer pagina 3
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generato il ${new Date().toLocaleString('it-IT')}`, pageWidth - margin, pageHeight - 5, { align: 'right' });

  // Salva
  const fileName = `Verbale_${(squadraBianca.nome || 'Bianca').replace(/\s+/g, '_')}_vs_${(squadraNera.nome || 'Nera').replace(/\s+/g, '_')}_${formatDate(infoPartita.data).replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
  
  return fileName;
}