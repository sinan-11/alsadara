const PDFDocument = require('pdfkit');

const BRAND_COLOR = '#4f46e5';
const LIGHT_GRAY = '#f3f4f6';
const BORDER_COLOR = '#e5e7eb';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6b7280';
const TEXT_MUTED = '#9ca3af';

const PAGE_WIDTH = 841.89; // A4 landscape
const PAGE_HEIGHT = 595.28;
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const TABLE_COLUMNS = [
  { key: 'no', label: 'No', width: 30 },
  { key: 'imei1', label: 'IMEI 1', width: 100 },
  { key: 'imei2', label: 'IMEI 2', width: 100 },
  { key: 'brand', label: 'Brand', width: 70 },
  { key: 'model', label: 'Model', width: 90 },
  { key: 'ram', label: 'RAM', width: 45 },
  { key: 'storage', label: 'Storage', width: 55 },
  { key: 'color', label: 'Color', width: 55 },
  { key: 'purchasePrice', label: 'Purchase', width: 65 },
  { key: 'sellingPrice', label: 'Selling', width: 65 },
  { key: 'status', label: 'Status', width: 65 },
];

const TABLE_ROW_HEIGHT = 18;
const TABLE_HEADER_HEIGHT = 22;
const TABLE_TOP = 210;
const TABLE_FOOTER_HEIGHT = 40;

function formatPriceINR(price) {
  if (!price || price === 0) return '-';
  return '\u20B9' + Number(price).toLocaleString('en-IN');
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function drawFooter(doc, pageNum, totalPages) {
  const y = PAGE_HEIGHT - 30;
  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor(TEXT_MUTED)
    .text('Mobile Stock Management System', MARGIN, y, {
      width: CONTENT_WIDTH / 2,
      align: 'left',
    });
  doc.text(`Page ${pageNum} of ${totalPages}`, MARGIN, y, {
    width: CONTENT_WIDTH,
    align: 'right',
  });
  doc
    .moveTo(MARGIN, y - 8)
    .lineTo(PAGE_WIDTH - MARGIN, y - 8)
    .lineWidth(0.5)
    .strokeColor(BORDER_COLOR)
    .stroke();
}

function drawTableHeader(doc, y) {
  let x = MARGIN;
  doc
    .rect(MARGIN, y, CONTENT_WIDTH, TABLE_HEADER_HEIGHT)
    .fill(BRAND_COLOR);

  TABLE_COLUMNS.forEach((col) => {
    doc
      .fontSize(7.5)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text(col.label, x + 3, y + 6, {
        width: col.width - 6,
        align: 'left',
      });
    x += col.width;
  });

  return y + TABLE_HEADER_HEIGHT;
}

function drawTableRow(doc, mobile, rowNum, y) {
  const bgColor = rowNum % 2 === 0 ? '#ffffff' : LIGHT_GRAY;
  let x = MARGIN;

  doc.rect(MARGIN, y, CONTENT_WIDTH, TABLE_ROW_HEIGHT).fill(bgColor);

  const values = [
    String(rowNum),
    mobile.imei1 || '-',
    mobile.imei2 || '-',
    mobile.brand || '-',
    mobile.model || '-',
    mobile.ram || '-',
    mobile.storage || '-',
    mobile.color || '-',
    formatPriceINR(mobile.purchasePrice),
    formatPriceINR(mobile.sellingPrice),
    mobile.status || '-',
  ];

  TABLE_COLUMNS.forEach((col, i) => {
    const val = values[i];
    const isStatus = col.key === 'status';

    doc.font('Helvetica').fontSize(7).fillColor(TEXT_PRIMARY);

    if (isStatus) {
      if (val === 'AVAILABLE') {
        doc.fillColor('#059669');
      } else if (val === 'SOLD') {
        doc.fillColor('#d97706');
      }
    }

    doc.text(val, x + 3, y + 5, {
      width: col.width - 6,
      align: 'left',
      lineBreak: false,
    });

    x += col.width;
  });

  return y + TABLE_ROW_HEIGHT;
}

function generatePDF(mobiles, filters, stats) {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: MARGIN,
      bufferPages: true,
      info: {
        Title: 'Mobile Stock Report',
        Author: 'MobileStock Management System',
        CreationDate: now,
      },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // --- HEADER ---
    doc
      .rect(0, 0, PAGE_WIDTH, 80)
      .fill(BRAND_COLOR);

    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('AL SADARA MOBILE PHONES', MARGIN, 25, { align: 'center' });

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#c7d2fe')
      .text(
        `Generated on ${formatDate(now)}  |  ${formatTime(now)}`,
        MARGIN,
        52,
        { align: 'center' }
      );

    // --- SUMMARY ---
    const summaryY = 95;
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(TEXT_PRIMARY)
      .text('STOCK SUMMARY', MARGIN, summaryY);

    doc
      .moveTo(MARGIN, summaryY + 14)
      .lineTo(MARGIN + 90, summaryY + 14)
      .lineWidth(1.5)
      .strokeColor(BRAND_COLOR)
      .stroke();

    const boxY = summaryY + 22;
    const boxWidth = 140;
    const boxGap = 15;

    const summaryItems = [
      { label: 'Total Mobiles', value: String(stats.total) },
      { label: 'Available', value: String(stats.available) },
      { label: 'Sold', value: String(stats.sold) },
    ];

    summaryItems.forEach((item, i) => {
      const bx = MARGIN + i * (boxWidth + boxGap);
      doc.roundedRect(bx, boxY, boxWidth, 48, 6).fill(LIGHT_GRAY);
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(TEXT_SECONDARY)
        .text(item.label, bx + 10, boxY + 8, { width: boxWidth - 20 });
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor(TEXT_PRIMARY)
        .text(item.value, bx + 10, boxY + 22, { width: boxWidth - 20 });
    });

    // --- FILTER INFO ---
    const filterParts = [];
    if (filters.search) filterParts.push(`Search: "${filters.search}"`);
    if (filters.status && filters.status !== 'ALL') filterParts.push(`Status: ${filters.status}`);
    if (filters.brand) filterParts.push(`Brand: ${filters.brand}`);

    if (filterParts.length > 0) {
      const filterY = boxY + 58;
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(TEXT_SECONDARY)
        .text('REPORT FILTER:', MARGIN, filterY);
      doc
        .font('Helvetica')
        .fillColor(TEXT_PRIMARY)
        .text(filterParts.join('  |  '), MARGIN + 80, filterY);
    }

    // --- TABLE ---
    let tableY = filterParts.length > 0 ? boxY + 82 : boxY + 70;

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(TEXT_PRIMARY)
      .text('STOCK DETAILS', MARGIN, tableY - 12);

    tableY = drawTableHeader(doc, tableY);

    let pageNum = 1;
    const estimatedTotalPages = Math.max(1, Math.ceil(mobiles.length / 30) + 1);

    if (mobiles.length === 0) {
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(TEXT_SECONDARY)
        .text('No stock records found for the selected filters.', MARGIN, tableY + 20, {
          width: CONTENT_WIDTH,
          align: 'center',
        });
    } else {
      mobiles.forEach((mobile, index) => {
        const nextY = tableY + TABLE_ROW_HEIGHT;

        if (nextY > PAGE_HEIGHT - TABLE_FOOTER_HEIGHT - MARGIN) {
          drawFooter(doc, pageNum, estimatedTotalPages);
          doc.addPage();
          pageNum++;
          tableY = drawTableHeader(doc, MARGIN + 10);
        }

        tableY = drawTableRow(doc, mobile, index + 1, tableY);
      });
    }

    // Final footer
    drawFooter(doc, pageNum, estimatedTotalPages);

    doc.end();
  });
}

module.exports = { generatePDF };
