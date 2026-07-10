import { ApiProperty } from '@nestjs/swagger';

export class SupportedFormatsResponseDto {
  @ApiProperty({
    description: 'File extensions supported by markitdown-js',
    example: ['pdf', 'docx', 'xlsx', 'pptx', 'csv', 'html', 'md', 'txt'],
    type: [String],
  })
  markitdown!: string[];

  @ApiProperty({
    description: 'File extensions supported by officeparser',
    example: ['docx', 'pptx', 'xlsx', 'odt', 'odp', 'ods', 'pdf'],
    type: [String],
  })
  officeparser!: string[];
}

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: '2024-01-15T08:30:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '1.0.0' })
  version!: string;

  @ApiProperty({ example: 'nestjs-doc-parser-poc' })
  service!: string;
}
