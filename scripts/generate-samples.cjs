/**
 * generate-samples.cjs
 * Generates sample PDF, DOCX, and XLSX files under ./test-samples/
 * Run: node scripts/generate-samples.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'test-samples');
fs.mkdirSync(OUT_DIR, { recursive: true });

// ─────────────────────────────────────────────────────────────────────────────
// 1. XLSX — via the bundled xlsx package
// ─────────────────────────────────────────────────────────────────────────────
async function generateXlsx() {
  const XLSX = require('xlsx');

  const wb = XLSX.utils.book_new();

  // Sheet 1: Sales data
  const salesData = [
    ['Quarter', 'Region',     'Product',       'Units Sold', 'Revenue (USD)', 'Growth %'],
    ['Q1 2024', 'North America', 'Widget Pro',   1240,         186000,           12.5],
    ['Q1 2024', 'Europe',        'Widget Pro',    890,         133500,            8.2],
    ['Q1 2024', 'Asia Pacific',  'Widget Pro',    670,         100500,           15.7],
    ['Q2 2024', 'North America', 'Widget Pro',   1450,         217500,           16.9],
    ['Q2 2024', 'Europe',        'Widget Pro',    975,         146250,            9.6],
    ['Q2 2024', 'Asia Pacific',  'Widget Pro',    810,         121500,           20.9],
    ['Q3 2024', 'North America', 'Gadget Lite',  2100,         294000,           22.1],
    ['Q3 2024', 'Europe',        'Gadget Lite',  1450,         203000,           18.5],
    ['Q3 2024', 'Asia Pacific',  'Gadget Lite',  1200,         168000,           25.3],
    ['Q4 2024', 'North America', 'Gadget Lite',  2600,         364000,           23.8],
    ['Q4 2024', 'Europe',        'Gadget Lite',  1800,         252000,           24.1],
    ['Q4 2024', 'Asia Pacific',  'Gadget Lite',  1550,         217000,           29.2],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(salesData);
  ws1['!cols'] = [{ wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Sales Data');

  // Sheet 2: Employee directory
  const employeeData = [
    ['Employee ID', 'Name',            'Department',  'Role',               'Salary',  'Start Date'],
    ['E001',        'Alice Johnson',   'Engineering', 'Senior Engineer',    120000,    '2019-03-15'],
    ['E002',        'Bob Martinez',    'Marketing',   'Marketing Manager',   95000,    '2020-07-01'],
    ['E003',        'Carol Lee',       'Engineering', 'Lead Architect',     145000,    '2018-01-10'],
    ['E004',        'David Kim',       'Finance',     'Financial Analyst',   85000,    '2021-05-20'],
    ['E005',        'Eva Patel',       'HR',          'HR Specialist',       72000,    '2022-02-14'],
    ['E006',        'Frank Chen',      'Engineering', 'DevOps Engineer',    110000,    '2020-11-30'],
    ['E007',        'Grace Thompson',  'Sales',       'Account Executive',   88000,    '2019-08-22'],
    ['E008',        'Henry Wilson',    'Engineering', 'QA Lead',             98000,    '2021-03-07'],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(employeeData);
  ws2['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 20 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Employees');

  // Sheet 3: Project tracker
  const projectData = [
    ['Project',         'Status',       'Priority', 'Owner',         'Start',      'End',        'Budget'],
    ['API Refactor',    'In Progress',  'High',     'Carol Lee',     '2024-01-15', '2024-04-30', 50000],
    ['Mobile App v2',   'Planning',     'High',     'Frank Chen',    '2024-03-01', '2024-09-30', 120000],
    ['Data Pipeline',   'Completed',    'Medium',   'Alice Johnson', '2023-10-01', '2024-01-31', 35000],
    ['CRM Migration',   'On Hold',      'Low',      'Bob Martinez',  '2024-05-01', '2024-12-31', 80000],
    ['Security Audit',  'In Progress',  'Critical', 'Henry Wilson',  '2024-02-01', '2024-03-31', 25000],
  ];

  const ws3 = XLSX.utils.aoa_to_sheet(projectData);
  XLSX.utils.book_append_sheet(wb, ws3, 'Projects');

  const outPath = path.join(OUT_DIR, 'sample.xlsx');
  XLSX.writeFile(wb, outPath);
  console.log(`✅ XLSX generated: ${outPath}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DOCX — via the docx package
// ─────────────────────────────────────────────────────────────────────────────
async function generateDocx() {
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    Table, TableRow, TableCell, WidthType, AlignmentType,
    BorderStyle,
  } = require('docx');

  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Category', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Q3 2024', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Q4 2024', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Change', bold: true })] })] }),
      ],
    }),
    ...[ 
      ['Revenue',          '$4.2M',   '$5.1M',   '+21.4%'],
      ['Operating Costs',  '$2.8M',   '$3.1M',   '+10.7%'],
      ['Net Profit',       '$1.4M',   '$2.0M',   '+42.9%'],
      ['Active Users',     '48,200',  '61,500',  '+27.6%'],
      ['Customer Churn',   '3.2%',    '2.8%',    '-12.5%'],
    ].map(([cat, q3, q4, chg]) =>
      new TableRow({
        children: [cat, q3, q4, chg].map(
          (text) => new TableCell({ children: [new Paragraph(text)] }),
        ),
      }),
    ),
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Acme Corp — Annual Business Review 2024',
            heading: HeadingLevel.TITLE,
          }),

          new Paragraph({
            text: 'Executive Summary',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Acme Corporation achieved record-breaking financial performance in fiscal year 2024, ' +
                'delivering 34% year-over-year revenue growth while maintaining disciplined cost management. ' +
                'Our strategic investments in product innovation, market expansion, and talent acquisition ' +
                'have positioned us strongly for sustained growth through 2025 and beyond.',
              ),
            ],
          }),

          new Paragraph({
            text: 'Financial Highlights',
            heading: HeadingLevel.HEADING_1,
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          }),

          new Paragraph({ text: '' }),

          new Paragraph({
            text: 'Strategic Initiatives',
            heading: HeadingLevel.HEADING_1,
          }),

          new Paragraph({ text: 'Product Innovation', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            children: [
              new TextRun(
                'We launched Gadget Lite in Q3 2024, which immediately became our best-selling product. ' +
                'The product achieved 1.2 million units sold within its first quarter, exceeding internal ' +
                'projections by 43%. The engineering team delivered the product two weeks ahead of schedule ' +
                'with a defect rate below 0.2%, setting a new quality benchmark for the organization.',
              ),
            ],
          }),

          new Paragraph({ text: 'Market Expansion', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            children: [
              new TextRun(
                'Asia Pacific emerged as our fastest-growing region in 2024, with 28% revenue growth. ' +
                'We established new distribution partnerships in Japan, South Korea, and Australia. ' +
                'The APAC team grew from 45 to 112 employees, reflecting our long-term commitment to the region. ' +
                'We project APAC to represent 30% of total revenue by end of FY2025.',
              ),
            ],
          }),

          new Paragraph({ text: 'Technology Roadmap', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            children: [
              new TextRun(
                'Our engineering team completed the core API refactoring initiative, reducing system latency ' +
                'by 67% and enabling a new class of real-time integrations with enterprise customers. ' +
                'The Mobile App v2 program, currently in planning phase, will introduce AI-powered features ' +
                'and an overhauled user experience targeting a Q3 2025 release.',
              ),
            ],
          }),

          new Paragraph({
            text: 'Workforce & Culture',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Headcount grew from 312 to 487 employees across 8 global offices in 2024. ' +
                'Employee Net Promoter Score (eNPS) reached 72, up from 58 in 2023. ' +
                'We launched the Engineering Excellence Program, certifying 94 engineers ' +
                'in advanced cloud architecture and security practices. ' +
                'Voluntary attrition fell to 8.3%, compared to an industry average of 14.1%.',
              ),
            ],
          }),

          new Paragraph({
            text: 'Outlook for 2025',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Management projects revenue of $22–24M for FY2025, representing 35–47% growth over FY2024. ' +
                'Key growth levers include the Gadget Lite Pro launch (Q1 2025), enterprise channel expansion, ' +
                'and the APAC manufacturing partnership expected to reduce COGS by 18%. ' +
                'Capital expenditure is budgeted at $3.8M, focused on R&D facilities and cloud infrastructure.',
              ),
            ],
          }),

          new Paragraph({
            text: 'Risk Factors',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Supply chain disruption remains the primary operational risk. Geopolitical tensions in key ' +
                'manufacturing regions could impact component availability and costs. We have partially ' +
                'mitigated this risk through a dual-sourcing strategy implemented in H2 2024. ' +
                'Foreign exchange headwinds, particularly EUR/USD and JPY/USD volatility, could impact ' +
                'reported APAC revenue by ±5% depending on market conditions.',
              ),
            ],
          }),

          new Paragraph({
            text: 'Conclusion',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun(
                '2024 was a transformational year for Acme Corporation. The foundations we have built — ' +
                'in product, in people, and in operational excellence — provide a compelling platform for ' +
                'the next phase of our growth journey. We are grateful to our employees, customers, ' +
                'and partners for their continued trust and support.',
              ),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(OUT_DIR, 'sample.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ DOCX generated: ${outPath}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PDF — via pdfkit
// ─────────────────────────────────────────────────────────────────────────────
async function generatePdf() {
  const PDFDocument = require('pdfkit');

  return new Promise((resolve, reject) => {
    const outPath = path.join(OUT_DIR, 'sample.pdf');
    const doc = new PDFDocument({ margin: 60, size: 'A4' });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    // Title
    doc.fontSize(22).font('Helvetica-Bold').text('NestJS Document Parser POC', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('Technical Specification & Architecture Guide', { align: 'center' });
    doc.moveDown(1.5);

    // Section helper
    const section = (title) => {
      doc.moveDown(0.8);
      doc.fontSize(14).font('Helvetica-Bold').text(title);
      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica');
    };

    const body = (text) => {
      doc.text(text, { align: 'justify', lineGap: 3 });
      doc.moveDown(0.5);
    };

    const bullet = (items) => {
      items.forEach((item) => {
        doc.text(`• ${item}`, { indent: 20, lineGap: 2 });
      });
      doc.moveDown(0.4);
    };

    section('1. Overview');
    body(
      'This document parser POC demonstrates a production-quality NestJS application that compares ' +
      'multiple document parsing libraries by extracting text from uploaded files and presenting ' +
      'results side-by-side. The system is designed following Clean Architecture principles with ' +
      'strict TypeScript typing and full SOLID compliance.',
    );

    section('2. Technology Stack');
    bullet([
      'Runtime: Node.js 24 with TypeScript 5.7 (strict mode)',
      'Framework: NestJS 11 with @nestjs/platform-express',
      'API Documentation: Swagger / OpenAPI 3.0 via @nestjs/swagger',
      'File Handling: Multer with disk storage (50 MB limit)',
      'Validation: class-validator + class-transformer',
      'Configuration: @nestjs/config with .env file support',
      'Logging: Winston with nest-winston integration',
      'Parser 1: markitdown-js (PDF, DOCX, XLSX, PPTX, CSV, HTML, MD, TXT)',
      'Parser 2: officeparser (DOCX, PPTX, XLSX, PDF, ODS, ODP, ODT)',
    ]);

    section('3. Architecture');
    body(
      'The application follows a layered Clean Architecture. The DocumentParser interface acts as ' +
      'the primary abstraction contract. Each library is encapsulated in its own injectable service ' +
      'implementing getName(), supports(), getSupportedExtensions(), and parse(). The ParserFactory ' +
      'acts as a central registry, enabling the controller to remain decoupled from individual parser implementations.',
    );

    section('4. API Endpoints');
    const endpoints = [
      ['POST /parse/markitdown',   'Upload a file → extract text via markitdown-js'],
      ['POST /parse/officeparser', 'Upload a file → extract text via officeparser'],
      ['POST /parse/all',          'Upload a file → run all supporting parsers in parallel'],
      ['POST /benchmark',          'Upload a file → run all parsers with timing + memory metrics'],
      ['GET  /supported-formats',  'Return file extensions supported per parser'],
      ['GET  /health',             'Service health check with timestamp'],
    ];

    endpoints.forEach(([ep, desc]) => {
      doc.font('Helvetica-Bold').text(ep, { continued: true, indent: 20 });
      doc.font('Helvetica').text(`  — ${desc}`);
    });
    doc.moveDown(0.5);

    section('5. Benchmark Metrics');
    body(
      'The /benchmark endpoint captures the following metrics for each parser run:',
    );
    bullet([
      'durationMs — wall-clock time from parse start to completion',
      'charactersExtracted — total character count in extracted text',
      'words — whitespace-delimited word count',
      'lines — newline-delimited line count',
      'memoryBeforeBytes — Node.js heap usage before parsing',
      'memoryAfterBytes — Node.js heap usage after parsing',
      'memoryUsedBytes — net heap delta (after − before)',
    ]);

    section('6. File Cleanup Strategy');
    body(
      'Uploaded files are stored temporarily in ./uploads using Multer\'s diskStorage with ' +
      'randomized filenames (timestamp + 8-byte hex). A FileCleanupInterceptor wraps every ' +
      'upload endpoint using RxJS finalize(), guaranteeing deletion after the response is sent ' +
      'regardless of success or error. This prevents disk accumulation without requiring a cron job.',
    );

    section('7. Winston Logging');
    body(
      'Every parse operation is logged at INFO level with context (parser name, file path, duration) ' +
      'and at ERROR level on failure with the full error message. In development mode, output is ' +
      'colorized in the NestJS nested format. In production, all transports emit structured JSON ' +
      'with timestamp, level, context, and message fields for log aggregation pipelines.',
    );

    section('8. Extension Points');
    body(
      'Adding a new parsing library requires only three steps: (1) create a new service class ' +
      'implementing the DocumentParser interface, (2) register it as a NestJS provider in ParserModule, ' +
      'and (3) inject it into the ParserFactory constructor. No changes to the controller, benchmark ' +
      'service, or any other component are required — a textbook Open/Closed principle implementation.',
    );

    section('9. Security Considerations');
    bullet([
      'File type validation at both Multer fileFilter and NestJS Pipe levels',
      'Randomized upload filenames prevent path-guessing attacks',
      'Maximum file size enforced at 50 MB to prevent resource exhaustion',
      'Temp files auto-deleted after parsing to minimize attack surface',
      'No database — no SQL injection surface; fully stateless per request',
    ]);

    section('10. Deployment Notes');
    body(
      'The application requires no external services and is fully self-contained. ' +
      'The /uploads directory must be writable by the Node.js process. ' +
      'For containerized deployments, mount /uploads as a tmpfs volume for optimal cleanup speed. ' +
      'Set NODE_ENV=production to switch Winston to structured JSON output and disable color formatting.',
    );

    doc.end();
    stream.on('finish', () => {
      console.log(`✅ PDF generated: ${outPath}`);
      resolve();
    });
    stream.on('error', reject);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n📄 Generating sample test files...\n');
  await generateXlsx();
  await generateDocx();
  await generatePdf();
  console.log('\n✅ All sample files created in ./test-samples/\n');
}

main().catch((err) => {
  console.error('❌ Generation failed:', err);
  process.exit(1);
});
