export interface ParseResult {
  parser: string;
  success: boolean;
  durationMs: number;
  text: string;
  error?: string;
}

export interface DocumentParser {
  /**
   * Returns the unique name identifier for this parser.
   */
  getName(): string;

  /**
   * Returns true if this parser supports the given file extension.
   * @param extension - lowercase file extension without dot (e.g. "pdf", "docx")
   */
  supports(extension: string): boolean;

  /**
   * Parses the document at the given file path and returns extracted text.
   * Must never throw — errors should be captured in ParseResult.error.
   * @param filePath - absolute or relative path to the file on disk
   */
  parse(filePath: string): Promise<ParseResult>;

  /**
   * Returns the list of supported file extensions.
   */
  getSupportedExtensions(): string[];
}
