export interface BenchmarkMetrics {
  parser: string;
  success: boolean;
  durationMs: number;
  charactersExtracted: number;
  words: number;
  lines: number;
  error?: string;
  memoryBeforeBytes: number;
  memoryAfterBytes: number;
  memoryUsedBytes: number;
}

export interface BenchmarkResult {
  filename: string;
  size: number;
  mimeType: string;
  benchmark: BenchmarkMetrics[];
}
