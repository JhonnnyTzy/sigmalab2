// Real PDF/Excel exporters using jsPDF + autoTable + xlsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export async function exportPDF(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string,
  meta?: string[],
) {
  const doc = new jsPDF();
  const navy = [30, 39, 97] as [number, number, number];
  const teal = [13, 148, 136] as [number, number, number]; 
  const textDark = [30, 30, 30] as [number, number, number];

  // 1. Cabecera (Cintillo superior)
  doc.setFillColor(teal[0], teal[1], teal[2]);
  doc.rect(0, 0, 210, 2, "F");
  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.rect(0, 2, 210, 4, "F");

  // 2. Logo corregido (Proporción vertical: ancho 12, alto 17)
  try {
    const img = new Image();
    img.src = "/logosvg.png";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    // Ajustado para que el escudo de la UMSA no se vea estirado ni aplastado
    doc.addImage(img, "PNG", 5, 11, 30, 17);
  } catch (error) {
    console.warn("No se pudo cargar el logo, se generará sin imagen.");
  }

  // 3. Tipografía Institucional
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("UNIVERSIDAD MAYOR DE SAN ANDRÉS", 32, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110, 110, 110);
  doc.text("ITIC · Carrera de Informática — Sistema SIGMALAB", 32, 24);

  // Línea divisoria
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  // 4. Título del Reporte (AHORA EN AZUL INSTITUCIONAL)
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(navy[0], navy[1], navy[2]); // Cambiado a Azul Navy
  doc.text(title, 14, 43);

  // Metadatos
  let cursorY = 50;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);

  const timestamp = `Generado el: ${new Date().toLocaleDateString("es-BO")} a las ${new Date().toLocaleTimeString("es-BO")}`;
  doc.text(timestamp, 14, cursorY);
  cursorY += 6;

  if (meta && meta.length) {
    meta.forEach((m) => {
      doc.text(m, 14, cursorY);
      cursorY += 5;
    });
  }
  
  cursorY += 5; 

  // 5. Tabla de datos
  autoTable(doc, {
    head: [headers],
    body: rows.map((r) => r.map((v) => String(v))),
    startY: cursorY,
    headStyles: { 
      fillColor: navy, 
      textColor: 255, 
      fontSize: 9,
      fontStyle: "bold",
      halign: "left",
      cellPadding: 3
    },
    bodyStyles: { 
      fontSize: 8,
      textColor: 70,
      cellPadding: 3
    },
    alternateRowStyles: { 
      fillColor: [250, 251, 253] 
    },
    styles: {
      lineColor: [240, 240, 240],
      lineWidth: 0.1,
    },
    margin: { left: 14, right: 14 },
    theme: "grid", 
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();

      // Pie de página
      doc.setDrawColor(navy[0], navy[1], navy[2]);
      doc.setLineWidth(0.3);
      doc.line(14, pageHeight - 12, 196, pageHeight - 12);

      doc.setFontSize(8);
      doc.setTextColor(140);
      doc.setFont("helvetica", "italic");
      doc.text("SIGMALAB - ITIC - Laboratorios", 14, pageHeight - 7);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Pág. ${data.pageNumber} / ${pageCount}`, 196, pageHeight - 7, { align: "right" });
    },
  });

  // 6. Firma Central Única
  let finalY = (doc as any).lastAutoTable.finalY + 40; 
  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2; // Centro de la página
  
  // Salto de página si la firma choca con el final
  if (finalY > pageHeight - 35) {
    doc.addPage();
    finalY = 50; 
  }

  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.3);

  // Línea de firma centrada (de 50px de ancho)
  doc.line(centerX - 25, finalY, centerX + 25, finalY);
  
  // Textos de la firma
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("Lic. Reynaldo Escobar Ibañez", centerX, finalY + 5, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(130, 130, 130);
  doc.text("Encargado · ITIC Laboratorios", centerX, finalY + 9, { align: "center" });

  doc.save(filename);
  toast.success(`PDF exportado exitosamente: ${filename}`);
}

export function exportExcel(sheetName: string, headers: string[], rows: (string | number)[][], filename: string) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!cols"] = headers.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 30));
  XLSX.writeFile(wb, filename);
  toast.success(`Excel exportado exitosamente: ${filename}`);
}

