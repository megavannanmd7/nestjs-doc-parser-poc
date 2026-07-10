import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BenchmarkMetrics, BenchmarkResult } from '../interfaces/benchmark-result.interface';

export class BenchmarkMetricsDto implements BenchmarkMetrics {
  @ApiProperty({ example: 'markitdown' })
  parser!: string;

  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ description: 'Parse duration in milliseconds', example: 312 })
  durationMs!: number;

  @ApiProperty({ description: 'Total number of characters extracted', example: 4523 })
  charactersExtracted!: number;

  @ApiProperty({ description: 'Total number of words extracted', example: 820 })
  words!: number;

  @ApiProperty({ description: 'Total number of lines extracted', example: 95 })
  lines!: number;

  @ApiProperty({ description: 'Heap memory usage before parsing (bytes)', example: 45678900 })
  memoryBeforeBytes!: number;

  @ApiProperty({ description: 'Heap memory usage after parsing (bytes)', example: 48901200 })
  memoryAfterBytes!: number;

  @ApiProperty({ description: 'Memory consumed during parsing (bytes)', example: 3222300 })
  memoryUsedBytes!: number;

  @ApiPropertyOptional({ description: 'Error message if parsing failed' })
  error?: string;
}

export class BenchmarkResponseDto implements BenchmarkResult {
  @ApiProperty({ example: 'report.pdf' })
  filename!: string;

  @ApiProperty({ description: 'File size in bytes', example: 204800 })
  size!: number;

  @ApiProperty({ description: 'MIME type of the uploaded file', example: 'application/pdf' })
  mimeType!: string;

  @ApiProperty({ type: [BenchmarkMetricsDto] })
  benchmark!: BenchmarkMetricsDto[];
}
