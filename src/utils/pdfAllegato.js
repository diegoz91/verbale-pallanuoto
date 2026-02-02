import jsPDF from 'jspdf';

export async function generateAllegatoPDF(state) {
  const { infoPartita, allegatoSanzioni, squadraBianca, squadraNera } = state;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  let y = margin;

  const formatDate = (dateStr) => {
    if (!dateStr) return '_______________';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT');
  };

  const formatPersona = (p) => {
    if (!p) return '';
    return p.nome || p.cognome ? `${p.nome || ''} ${p.cognome || ''}`.trim() : '';
  };

  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.setTextColor(0, 0, 0);

  // INTESTAZIONE
  doc.rect(margin, y, pageWidth - 2*margin, 28);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FIN', margin + 8, y + 12);
  doc.setFontSize(8);
  doc.text('FEDERAZIONE ITALIANA NUOTO', margin + 5, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text('GRUPPO UFFICIALI GARA', margin + 5, y + 23);
  
  doc.line(margin + 50, y, margin + 50, y + 28);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ALLEGATO AL VERBALE DI PARTITA DI PALLANUOTO', margin + 55, y + 10);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`DEL ${formatDate(infoPartita.data)}    GIOCATA A ${(infoPartita.luogo || '_______________').substring(0, 25)}`, margin + 55, y + 17);
  doc.text(`${(squadraBianca.nome || 'Squadra Bianca').substring(0, 20)} vs ${(squadraNera.nome || 'Squadra Nera').substring(0, 20)}`, margin + 55, y + 23);
  
  doc.line(pageWidth - margin - 25, y, pageWidth - margin - 25, y + 28);
  doc.setFontSize(8);
  doc.text('SERIE', pageWidth - margin - 20, y + 10);
  doc.line(pageWidth - margin - 22, y + 15, pageWidth - margin - 5, y + 15);
  
  y += 32;

  // NOTIZIE PER LA GIUSTIZIA FEDERALE
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Notizie per la Giustizia Federale.', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('(Regolarità del campo, ritardi, sospensioni, abbigliamento giocatori)', margin + 55, y);
  
  y += 5;
  doc.rect(margin, y, pageWidth - 2*margin, 25);
  
  if (allegatoSanzioni.notizieGiustizia) {
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(allegatoSanzioni.notizieGiustizia, pageWidth - 2*margin - 6);
    doc.text(lines.slice(0, 5), margin + 3, y + 5);
  }
  
  for (let i = 0; i < 4; i++) {
    doc.line(margin + 2, y + 6 + (i * 5), pageWidth - margin - 2, y + 6 + (i * 5));
  }
  
  y += 28;

  // FORZA PUBBLICA PRESENTE
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Forza Pubblica presente:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(allegatoSanzioni.forzaPubblica || '', margin + 45, y);
  doc.line(margin + 45, y + 1, pageWidth - margin, y + 1);
  
  y += 8;

  // COMPORTAMENTO
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Comportamento dei dirigenti, degli atleti e del pubblico:', margin, y);
  
  y += 5;
  doc.rect(margin, y, pageWidth - 2*margin, 55);
  
  if (allegatoSanzioni.comportamento) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(allegatoSanzioni.comportamento, pageWidth - 2*margin - 6);
    doc.text(lines.slice(0, 12), margin + 3, y + 5);
  }
  
  for (let i = 0; i < 10; i++) {
    doc.line(margin + 2, y + 6 + (i * 5), pageWidth - margin - 2, y + 6 + (i * 5));
  }
  
  y += 60;

  // RIEPILOGO ESPULSIONI DEFINITIVE
  doc.rect(margin, y, pageWidth - 2*margin, 75);
  
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, (pageWidth - 2*margin) * 0.5, 8, 'F');
  doc.rect(margin + (pageWidth - 2*margin) * 0.5, y, (pageWidth - 2*margin) * 0.5, 8, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Riepilogo delle principali espulsioni definitive', margin + 3, y + 5);
  doc.text('Motivazione', margin + (pageWidth - 2*margin) * 0.5 + 3, y + 5);
  
  doc.line(margin, y + 8, pageWidth - margin, y + 8);
  doc.line(margin + (pageWidth - 2*margin) * 0.5, y, margin + (pageWidth - 2*margin) * 0.5, y + 75);
  
  y += 10;
  
  const articoli = [
    { art: 'art. 5.4', desc: 'oggetti' },
    { art: 'art. 5.5', desc: 'ungersi il corpo' },
    { art: 'art. 21.13', desc: 'gioco aggressivo / cattiva condotta' },
    { art: 'art. 21.14', desc: 'brutalità' }
  ];
  
  let artY = y;
  doc.setFontSize(7);
  
  articoli.forEach((art, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.text(art.art, margin + 3, artY);
    doc.setFont('helvetica', 'normal');
    doc.text(art.desc, margin + 18, artY);
    
    const esp = allegatoSanzioni.espulsioni[idx];
    if (esp && esp.motivazione) {
      doc.text(esp.motivazione.substring(0, 50), margin + (pageWidth - 2*margin) * 0.5 + 3, artY);
    }
    if (esp && esp.giocatore) {
      doc.text(`${esp.giocatore} (${esp.squadra === 'B' ? 'Bianca' : 'Nera'})`, margin + (pageWidth - 2*margin) * 0.5 + 3, artY + 4);
    }
    
    artY += 15;
  });

  // DATA E ARBITRI
  y = pageHeight - 35;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Data', margin, y);
  doc.line(margin + 10, y + 1, margin + 50, y + 1);
  doc.text(formatDate(infoPartita.data), margin + 15, y);
  
  doc.text('Arbitro/i', margin + 80, y);
  doc.line(margin + 100, y + 1, pageWidth - margin, y + 1);
  const arbitri = `${formatPersona(infoPartita.arbitro1)}${infoPartita.arbitro2?.nome ? ' - ' + formatPersona(infoPartita.arbitro2) : ''}`;
  doc.text(arbitri.substring(0, 50), margin + 105, y);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generato il ${new Date().toLocaleString('it-IT')}`, pageWidth - margin, pageHeight - 10, { align: 'right' });

  const fileName = `Allegato_Sanzioni_${formatDate(infoPartita.data).replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
  
  return fileName;
}