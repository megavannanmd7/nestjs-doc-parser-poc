import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ParseResult } from '../interfaces/document-parser.interface';

export class SingleParseResponseDto {
  @ApiProperty({ description: 'Name of the parser used', example: 'markitdown' })
  parser!: string;

  @ApiProperty({ description: 'Time taken to parse the document in milliseconds', example: 312 })
  durationMs!: number;

  @ApiProperty({
    description: 'Extracted text content from the document',
    example: '# My Document\n\nThis is the extracted content...',
  })
  text!: string;

  @ApiPropertyOptional({ description: 'Error message if parsing failed', example: 'Unsupported format' })
  error?: string;
}

export class ParseResultDto implements ParseResult {
  @ApiProperty({ example: 'markitdown' })
  parser!: string;

  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 312 })
  durationMs!: number;

  @ApiProperty({ example: '# Document content...' })
  text!: string;

  @ApiPropertyOptional({ example: 'Failed to parse: unsupported format' })
  error?: string;
}

export class ParseAllResponseDto {
  @ApiProperty({ description: 'Original uploaded filename', example: 'report.pdf' })
  filename!: string;

  @ApiProperty({ type: [ParseResultDto], description: 'Results from each parser' })
  parsers!: ParseResultDto[];
}
