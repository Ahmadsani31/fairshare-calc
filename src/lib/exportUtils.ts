import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatCurrency } from './utils';
// Define a type for the calculation data structure for type safety
interface CalculationData {
  itemBreakdown: {
    name: string;
    itemGrossPrice: number;
    itemDiscount: number;
    itemNetPrice: number;
    itemNetPricePerQty: number;
  }[];
  totalGrossPrice: number;
  appliedDiscount: number;
  shippingCost: number;
  totalNetPrice: number;
  pricePerPerson: number;
  numberOfPeople: number;
}
/**
 * Exports the calculation results to a PDF file.
 * @param data - The calculation data.
 */
export const exportToPdf = (data: CalculationData) => {
  const doc = new jsPDF();
  const tableColumn = ["Nama Makanan", "Harga Asli", "Diskon", "Harga Akhir", "Harga/Porsi"];
  const tableRows = data.itemBreakdown.map(item => [
    item.name || "Item Tanpa Nama",
    formatCurrency(item.itemGrossPrice),
    `-${formatCurrency(item.itemDiscount)}`,
    formatCurrency(item.itemNetPrice),
    formatCurrency(item.itemNetPricePerQty)
  ]);
  doc.setFontSize(18);
  doc.text("FairShare Calc - Hasil Perhitungan", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  autoTable(doc, {
    startY: 30,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [3, 7, 18] }, // Dark blue for header
  });
  let finalY = (doc as any).lastAutoTable.finalY || 70;
  doc.setFontSize(12);
  doc.text("Ringkasan Total:", 14, finalY + 10);
  const summary = [
    ["Total Belanja:", formatCurrency(data.totalGrossPrice)],
    ["Total Diskon:", `-${formatCurrency(data.appliedDiscount)}`],
    ["Total Ongkos Kirim:", formatCurrency(data.shippingCost)],
    ["Total Pembayaran:", formatCurrency(data.totalNetPrice)],
  ];
  if (data.numberOfPeople > 1) {
    summary.push(["Pembayaran Per Orang:", formatCurrency(data.pricePerPerson)]);
  }
  autoTable(doc, {
    startY: finalY + 15,
    body: summary,
    theme: 'plain',
    styles: { cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold' } },
  });
  doc.save("hasil-perhitungan.pdf");
};
/**
 * Exports the calculation results to an Excel file.
 * @param data - The calculation data.
 */
export const exportToExcel = (data: CalculationData) => {
  const worksheetData = data.itemBreakdown.map(item => ({
    "Nama Makanan": item.name || "Item Tanpa Nama",
    "Harga Asli": item.itemGrossPrice,
    "Diskon": item.itemDiscount,
    "Harga Akhir": item.itemNetPrice,
    "Harga/Porsi": item.itemNetPricePerQty,
  }));
  // Add summary rows
  worksheetData.push({} as any); // Spacer row
  worksheetData.push({ "Nama Makanan": "Total Belanja", "Harga Asli": data.totalGrossPrice } as any);
  worksheetData.push({ "Nama Makanan": "Total Diskon", "Harga Asli": -data.appliedDiscount } as any);
  worksheetData.push({ "Nama Makanan": "Total Ongkos Kirim", "Harga Asli": data.shippingCost } as any);
  worksheetData.push({ "Nama Makanan": "Total Pembayaran", "Harga Asli": data.totalNetPrice } as any);
  if (data.numberOfPeople > 1) {
    worksheetData.push({ "Nama Makanan": `Pembayaran Per Orang (${data.numberOfPeople} orang)`, "Harga Asli": data.pricePerPerson } as any);
  }
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Perhitungan");
  // Adjust column widths
  worksheet['!cols'] = [
    { wch: 30 }, // Nama Makanan
    { wch: 15 }, // Harga Asli
    { wch: 15 }, // Diskon
    { wch: 15 }, // Harga Akhir
    { wch: 15 }, // Harga/Porsi
  ];
  XLSX.writeFile(workbook, "hasil-perhitungan.xlsx");
};