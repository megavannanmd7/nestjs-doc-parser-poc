import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  UsePipes,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Express } from 'express';
import { ParserFactory } from '../services/parser.factory';
import { BenchmarkService } from '../services/benchmark.service';
import { FileCleanupInterceptor } from '../../common/interceptors/file-cleanup.interceptor';
import { FileTypeValidationPipe } from '../../common/pipes/file-type-validation.pipe';
import {
  SingleParseResponseDto,
  ParseAllResponseDto,
  ParseResultDto,
} from '../dto/parse-response.dto';
import { BenchmarkResponseDto } from '../dto/benchmark-response.dto';
import {
  SupportedFormatsResponseDto,
  HealthResponseDto,
} from '../dto/supported-formats-response.dto';

const FILE_UPLOAD_BODY = {
  schema: {
    type: 'object',
    required: ['file'],
    properties: {
      file: {
        type: 'string',
        format: 'binary',
        description:
          'Document to parse. Supported: pdf, docx, xlsx, pptx, csv, html, md, txt (max 50 MB)',
      },
    },
  },
};

@ApiTags('Parser')
@Controller()
export class ParserController {
  private readonly logger = new Logger(ParserController.name);

  constructor(
    private readonly parserFactory: ParserFactory,
    private readonly benchmarkService: BenchmarkService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /parse/markitdown
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('parse/markitdown')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'), FileCleanupInterceptor)
  @UsePipes()
  @ApiOperation({
    summary: 'Parse a document using MarkItDown',
    description:
      'Uploads a document and extracts text using the markitdown-js library. Returns parser name, duration, and extracted text.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(FILE_UPLOAD_BODY)
  @ApiResponse({ status: 200, description: 'Successfully parsed', type: SingleParseResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file type or missing file' })
  @ApiResponse({ status: 413, description: 'File exceeds 50 MB limit' })
  async parseWithMarkitdown(
    @UploadedFile(new FileTypeValidationPipe()) file: Express.Multer.File,
  ): Promise<SingleParseResponseDto> {
    this.logger.log(`[/parse/markitdown] Received: ${file.originalname} (${file.size} bytes)`);

    const parser = this.parserFactory.getParser('markitdown');
    if (!parser) {
      throw new Error('markitdown parser not registered');
    }

    const result = await parser.parse(file.path);

    return {
      parser: result.parser,
      durationMs: result.durationMs,
      text: result.text,
      ...(result.error ? { error: result.error } : {}),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /parse/officeparser
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('parse/officeparser')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'), FileCleanupInterceptor)
  @ApiOperation({
    summary: 'Parse a document using OfficeParser',
    description:
      'Uploads a document and extracts text using the officeparser library. Returns parser name, duration, and extracted text.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(FILE_UPLOAD_BODY)
  @ApiResponse({ status: 200, description: 'Successfully parsed', type: SingleParseResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file type or missing file' })
  @ApiResponse({ status: 413, description: 'File exceeds 50 MB limit' })
  async parseWithOfficeparser(
    @UploadedFile(new FileTypeValidationPipe()) file: Express.Multer.File,
  ): Promise<SingleParseResponseDto> {
    this.logger.log(`[/parse/officeparser] Received: ${file.originalname} (${file.size} bytes)`);

    const parser = this.parserFactory.getParser('officeparser');
    if (!parser) {
      throw new Error('officeparser parser not registered');
    }

    const result = await parser.parse(file.path);

    return {
      parser: result.parser,
      durationMs: result.durationMs,
      text: result.text,
      ...(result.error ? { error: result.error } : {}),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /parse/all
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('parse/all')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'), FileCleanupInterceptor)
  @ApiOperation({
    summary: 'Parse a document with all available parsers',
    description:
      'Uploads a document and extracts text using all parsers that support the file type. Results are returned side-by-side for comparison.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(FILE_UPLOAD_BODY)
  @ApiResponse({ status: 200, description: 'Successfully parsed by all supporting parsers', type: ParseAllResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file type or missing file' })
  async parseWithAll(
    @UploadedFile(new FileTypeValidationPipe()) file: Express.Multer.File,
  ): Promise<ParseAllResponseDto> {
    this.logger.log(`[/parse/all] Received: ${file.originalname} (${file.size} bytes)`);

    const supportingParsers = this.parserFactory.getSupportingParsers(file.originalname);

    this.logger.log(
      `[/parse/all] Dispatching to: ${supportingParsers.map((p) => p.getName()).join(', ')}`,
    );

    const results = await Promise.all(
      supportingParsers.map((parser) => parser.parse(file.path)),
    );

    const parsers: ParseResultDto[] = results.map((r) => ({
      parser: r.parser,
      success: r.success,
      durationMs: r.durationMs,
      text: r.text,
      ...(r.error ? { error: r.error } : {}),
    }));

    return {
      filename: file.originalname,
      parsers,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /benchmark
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('benchmark')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'), FileCleanupInterceptor)
  @ApiOperation({
    summary: 'Benchmark all parsers on a document',
    description:
      'Runs all available parsers on the uploaded document and returns detailed metrics including parse time, character/word/line counts, and memory usage.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(FILE_UPLOAD_BODY)
  @ApiResponse({ status: 200, description: 'Benchmark complete', type: BenchmarkResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file type or missing file' })
  async benchmark(
    @UploadedFile(new FileTypeValidationPipe()) file: Express.Multer.File,
  ): Promise<BenchmarkResponseDto> {
    this.logger.log(`[/benchmark] Received: ${file.originalname} (${file.size} bytes)`);

    const result = await this.benchmarkService.benchmarkAll(
      file.path,
      file.originalname,
      file.size,
      file.mimetype,
    );

    return {
      filename: result.filename,
      size: result.size,
      mimeType: result.mimeType,
      benchmark: result.benchmark.map((b) => ({
        parser: b.parser,
        success: b.success,
        durationMs: b.durationMs,
        charactersExtracted: b.charactersExtracted,
        words: b.words,
        lines: b.lines,
        memoryBeforeBytes: b.memoryBeforeBytes,
        memoryAfterBytes: b.memoryAfterBytes,
        memoryUsedBytes: b.memoryUsedBytes,
        ...(b.error ? { error: b.error } : {}),
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /supported-formats
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('supported-formats')
  @ApiOperation({
    summary: 'List supported file formats per parser',
    description:
      'Returns the file extensions supported by each registered parser.',
  })
  @ApiResponse({
    status: 200,
    description: 'Supported formats by parser',
    type: SupportedFormatsResponseDto,
  })
  getSupportedFormats(): SupportedFormatsResponseDto {
    const formats = this.parserFactory.getSupportedFormats();

    return {
      markitdown: formats['markitdown'] ?? [],
      officeparser: formats['officeparser'] ?? [],
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /health
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the current service status and timestamp.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    type: HealthResponseDto,
  })
  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'nestjs-doc-parser-poc',
    };
  }
}
