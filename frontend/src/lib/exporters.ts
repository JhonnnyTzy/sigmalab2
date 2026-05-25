// Real PDF/Excel exporters using jsPDF + xlsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export function exportPDF(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string,
  meta?: string[],
) {
  const doc = new jsPDF();
  // Logo placeholder (navy circle with "U")
  doc.setFillColor(30, 39, 97);
  doc.circle(20, 20, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("U", 17.5, 23);
  // Institutional header
  doc.setTextColor(30, 39, 97);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("UNIVERSIDAD MAYOR DE SAN ANDRÉS", 32, 17);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("ITIC · Laboratorios — Sistema SIGMALAB", 32, 23);
  // Divider
  doc.setDrawColor(30, 39, 97);
  doc.setLineWidth(0.7);
  doc.line(14, 30, 196, 30);
  // Report title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 39, 97);
  doc.text(title, 14, 39);
  // Metadata block
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  doc.text(`Fecha y hora de generación: ${new Date().toLocaleString("es-BO")}`, 14, 45);
  let cursorY = 50;
  if (meta && meta.length) {
    meta.forEach((m) => {
      doc.text(m, 14, cursorY);
      cursorY += 5;
    });
    cursorY += 1;
  }
  autoTable(doc, {
    head: [headers],
    body: rows.map((r) => r.map((v) => String(v))),
    startY: cursorY,
    headStyles: { fillColor: [30, 39, 97], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height || pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        `SIGMALAB · ITIC UMSA — Página ${data.pageNumber} de ${pageCount}`,
        14,
        pageHeight - 8,
      );
    },
  });
  doc.save(filename);
  toast.success(`PDF exportado: ${filename}`);
}

export function exportExcel(sheetName: string, headers: string[], rows: (string | number)[][], filename: string) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!cols"] = headers.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 30));
  XLSX.writeFile(wb, filename);
  toast.success(`Excel exportado: ${filename}`);
}
