# NestJS Document Parser POC

> Compare multiple document parsing libraries by uploading the same file and viewing extracted text side-by-side.

## Overview

This POC benchmarks **markitdown-js** vs **officeParser** for document text extraction. Upload any supported document and get extraction results, timing data, and memory metrics from each library.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (latest) |
| Language | TypeScript (strict) |
| API Docs | Swagger / OpenAPI 3.0 |
| File Upload | Multer |
| Validation | class-validator / class-transformer |
| Config | @nestjs/config + .env |
| Logging | Winston (nest-winston) |
| Architecture | Clean Architecture / SOLID |

## Supported File Types

| Extension | markitdown | officeparser |
|---|---|---|
| .pdf | ✅ | ✅ |
| .docx | ✅ | ✅ |
| .xlsx | ✅ | ✅ |
| .pptx | ✅ | ✅ |
| .csv | ✅ | ❌ |
| .html | ✅ | ❌ |
| .md | ✅ | ❌ |
| .txt | ✅ | ❌ |

Max file size: **50 MB**

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file (already included)
# .env is pre-configured with defaults

# 3. Start in development mode
npm run start:dev

# 4. Open Swagger UI
# http://localhost:3000/api
```

---

## API Endpoints

### 1. `GET /health` — Health Check

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T08:30:00.000Z",
  "version": "1.0.0",
  "service": "nestjs-doc-parser-poc"
}
```

---

### 2. `GET /supported-formats` — Supported File Extensions

```bash
curl http://localhost:3000/supported-formats
```

**Response:**
```json
{
  "markitdown": ["pdf", "docx", "xlsx", "pptx", "csv", "html", "md", "txt"],
  "officeparser": ["docx", "pptx", "xlsx", "pdf", "odt", "odp", "ods"]
}
```

---

### 3. `POST /parse/markitdown` — Parse with MarkItDown

```bash
curl -X POST http://localhost:3000/parse/markitdown \
  -F "file=@./path/to/document.pdf"
```

**Response:**
```json
{
  "parser": "markitdown",
  "durationMs": 312,
  "text": "# My Document\n\nExtracted content here..."
}
```

---

### 4. `POST /parse/officeparser` — Parse with OfficeParser

```bash
curl -X POST http://localhost:3000/parse/officeparser \
  -F "file=@./path/to/document.docx"
```

**Response:**
```json
{
  "parser": "officeparser",
  "durationMs": 158,
  "text": "Extracted content here..."
}
```

---

### 5. `POST /parse/all` — Parse with All Parsers (Side-by-Side)

```bash
curl -X POST http://localhost:3000/parse/all \
  -F "file=@./path/to/document.pdf"
```

**Response:**
```json
{
  "filename": "document.pdf",
  "parsers": [
    {
      "parser": "markitdown",
      "success": true,
      "durationMs": 312,
      "text": "# Extracted with MarkItDown..."
    },
    {
      "parser": "officeparser",
      "success": true,
      "durationMs": 158,
      "text": "Extracted with OfficeParser..."
    }
  ]
}
```

---

### 6. `POST /benchmark` — Full Benchmark with Metrics

```bash
curl -X POST http://localhost:3000/benchmark \
  -F "file=@./path/to/document.pdf"
```

**Response:**
```json
{
  "filename": "document.pdf",
  "size": 204800,
  "mimeType": "application/pdf",
  "benchmark": [
    {
      "parser": "markitdown",
      "success": true,
      "durationMs": 312,
      "charactersExtracted": 4523,
      "words": 820,
      "lines": 95,
      "memoryBeforeBytes": 45678900,
      "memoryAfterBytes": 48901200,
      "memoryUsedBytes": 3222300
    },
    {
      "parser": "officeparser",
      "success": true,
      "durationMs": 158,
      "charactersExtracted": 4410,
      "words": 810,
      "lines": 92,
      "memoryBeforeBytes": 48910000,
      "memoryAfterBytes": 51200000,
      "memoryUsedBytes": 2290000
    }
  ]
}
```

---

## Project Structure

```
src/
├── main.ts                          # App bootstrap: Swagger, logger, validation
├── app.module.ts                    # Root module
├── common/
│   ├── constants/
│   │   └── file.constants.ts        # Allowed extensions, size limits, MIME types
│   ├── utils/
│   │   ├── file.util.ts             # Extension helper, safe file delete
│   │   └── text-statistics.util.ts  # Character/word/line/paragraph counters
│   ├── pipes/
│   │   └── file-type-validation.pipe.ts   # Validates file extension
│   ├── interceptors/
│   │   └── file-cleanup.interceptor.ts    # Auto-deletes temp files post-response
│   └── logger/
│       └── winston.config.ts        # Winston configuration
├── parser/
│   ├── parser.module.ts
│   ├── controllers/
│   │   └── parser.controller.ts     # 6 REST endpoints
│   ├── services/
│   │   ├── markitdown.service.ts    # DocumentParser via markitdown-js
│   │   ├── officeparser.service.ts  # DocumentParser via officeparser
│   │   ├── parser.factory.ts        # Parser registry and lookup
│   │   └── benchmark.service.ts     # Parallel benchmark orchestration
│   ├── dto/
│   │   ├── parse-response.dto.ts
│   │   ├── benchmark-response.dto.ts
│   │   └── supported-formats-response.dto.ts
│   └── interfaces/
│       ├── document-parser.interface.ts   # DocumentParser + ParseResult contracts
│       └── benchmark-result.interface.ts  # BenchmarkMetrics + BenchmarkResult
└── upload/
    ├── upload.module.ts              # MulterModule with async config
    └── multer-config.service.ts      # MulterOptionsFactory implementation
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP server port |
| `UPLOAD_DIR` | `./uploads` | Temporary upload directory |
| `MAX_FILE_SIZE` | `52428800` | Max upload size in bytes (50 MB) |
| `LOG_LEVEL` | `info` | Winston log level |
| `NODE_ENV` | `development` | Environment mode |

---

## Architecture Notes

- **DocumentParser interface** — each library service implements `getName()`, `supports(ext)`, `getSupportedExtensions()`, and `parse(filePath)`.
- **ParserFactory** — central registry; add new parsers by injecting them here.
- **BenchmarkService** — runs all parsers in parallel with `Promise.all`; never throws if one parser fails.
- **FileCleanupInterceptor** — uses RxJS `finalize()` to guarantee temp file deletion after response.
- **FileTypeValidationPipe** — validates at NestJS pipe level before the service is invoked.
- **Winston** — structured JSON logs in production, colorized dev logs in development.
