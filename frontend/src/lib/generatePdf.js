import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Genera un PDF a partir del elemento con clase .print-area
 * y lo descarga con el nombre dado.
 */
export async function generateEventPdf(filename = 'presupuesto.pdf') {
  const element = document.querySelector('.print-area');
  if (!element) throw new Error('No se encontró el área de impresión');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#0f0f0f', // fondo oscuro de la app
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let y = 0;
  while (y < imgHeight) {
    if (y > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, -y, imgWidth, imgHeight);
    y += pageHeight;
  }

  pdf.save(filename);
}
