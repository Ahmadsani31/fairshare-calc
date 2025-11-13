import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
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
 * Exports the calculation results to a styled Excel file using exceljs.
 * @param data - The calculation data.
 */
export const exportToExcel = async (data: CalculationData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Perhitungan');
  // Define columns with headers, keys, widths, and number formats
  worksheet.columns = [
    { header: 'Nama Makanan', key: 'name', width: 35 },
    { header: 'Harga Asli', key: 'itemGrossPrice', width: 20, style: { numFmt: '"Rp"#,##0.00' } },
    { header: 'Diskon', key: 'itemDiscount', width: 20, style: { numFmt: '"-Rp"#,##0.00' } },
    { header: 'Harga Akhir', key: 'itemNetPrice', width: 20, style: { numFmt: '"Rp"#,##0.00' } },
    { header: 'Harga/Porsi', key: 'itemNetPricePerQty', width: 20, style: { numFmt: '"Rp"#,##0.00' } },
  ];
  // Style header row
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF030712' }, // Equivalent to bg-gray-950
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  worksheet.getRow(1).height = 20;
  // Add item data rows
  const dataRows = data.itemBreakdown.map(item => ({
    name: item.name || "Item Tanpa Nama",
    itemGrossPrice: item.itemGrossPrice,
    itemDiscount: item.itemDiscount,
    itemNetPrice: item.itemNetPrice,
    itemNetPricePerQty: item.itemNetPricePerQty,
  }));
  worksheet.addRows(dataRows);
  // Style data rows (discount cell and alignment)
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      const discountCell = row.getCell('itemDiscount');
      discountCell.font = { color: { argb: 'FF16A34A' } }; // green-600
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = { vertical: 'middle' };
        if (cell.address.match(/A\d+/)) {
          cell.alignment.horizontal = 'left';
        } else {
          cell.alignment.horizontal = 'right';
        }
      });
    }
  });
  // Add summary section
  worksheet.addRow([]); // Spacer row
  const summaryStartRow = worksheet.rowCount + 1;
  worksheet.addRow(['Total Belanja:', data.totalGrossPrice]);
  worksheet.addRow(['Total Diskon:', -data.appliedDiscount]);
  worksheet.addRow(['Total Ongkos Kirim:', data.shippingCost]);
  const totalRow = worksheet.addRow(['Total Pembayaran:', data.totalNetPrice]);
  if (data.numberOfPeople > 1) {
    worksheet.addRow([`Pembayaran Per Orang (${data.numberOfPeople} orang):`, data.pricePerPerson]);
  }
  // Style summary section
  for (let i = summaryStartRow; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    row.getCell(1).font = { bold: true };
    row.getCell(2).style = { numFmt: '"Rp"#,##0.00', font: { bold: true } };
    row.getCell(2).alignment = { horizontal: 'right' };
  }
  // Highlight the final total row
  totalRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' }, // slate-100
    };
  });
  // Generate file and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hasil-perhitungan.xlsx';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};