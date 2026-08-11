import PDFDocument from 'pdfkit';
import { Response } from 'express';

export function generateInvoicePdf(challan: any, res: Response) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=invoice-${challan.challan_number}.pdf`);

  doc.pipe(res);

  doc.fontSize(20).text('INVOICE / CHALLAN', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Challan Number: ${challan.challan_number}`);
  doc.text(`Date: ${new Date(challan.created_at).toLocaleDateString()}`);
  doc.text(`Status: ${challan.status.toUpperCase()}`);
  doc.moveDown();

  doc.text(`Customer: ${challan.customer_name}`);
  doc.text(`Mobile: ${challan.customer_mobile}`);
  if (challan.customer_address) doc.text(`Address: ${challan.customer_address}`);
  doc.moveDown();

  doc.fontSize(14).text('Items', { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(10);
  const tableTop = doc.y;
  doc.text('Product', 50, tableTop);
  doc.text('SKU', 220, tableTop);
  doc.text('Qty', 320, tableTop);
  doc.text('Unit Price', 380, tableTop);
  doc.text('Total', 470, tableTop);
  doc.moveDown();

  let grandTotal = 0;
  for (const item of challan.items) {
    const y = doc.y;
    doc.text(item.product_name_snap, 50, y, { width: 160 });
    doc.text(item.product_sku_snap, 220, y);
    doc.text(String(item.quantity), 320, y);
    doc.text(`Rs. ${parseFloat(item.unit_price_snap).toFixed(2)}`, 380, y);
    doc.text(`Rs. ${parseFloat(item.line_total).toFixed(2)}`, 470, y);
    grandTotal += parseFloat(item.line_total);
    doc.moveDown();
  }

  doc.moveDown();
  doc.fontSize(12).text(`Total Quantity: ${challan.total_quantity}`, { align: 'right' });
  doc.fontSize(14).text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, { align: 'right' });

  doc.end();
}