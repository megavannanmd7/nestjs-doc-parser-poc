import { Injectable } from '@nestjs/common';
import { DocumentParser } from '../interfaces/document-parser.interface';
import { MarkitdownService } from './markitdown.service';
import { OfficeparserService } from './officeparser.service';
import { getExtension } from '../../common/utils/file.util';

@Injectable()
export class ParserFactory {
  private readonly parsers: DocumentParser[];

  constructor(
    private readonly markitdownService: MarkitdownService,
    private readonly officeparserService: OfficeparserService,
  ) {
    this.parsers = [this.markitdownService, this.officeparserService];
  }

  /**
   * Returns a parser by its name identifier.
   */
  getParser(name: string): DocumentParser | undefined {
    return this.parsers.find(
      (p) => p.getName().toLowerCase() === name.toLowerCase(),
    );
  }

  /**
   * Returns all registered parsers.
   */
  getAllParsers(): DocumentParser[] {
    return [...this.parsers];
  }

  /**
   * Returns all parsers that declare support for the given filename's extension.
   */
  getSupportingParsers(filename: string): DocumentParser[] {
    const ext = getExtension(filename);
    return this.parsers.filter((p) => p.supports(ext));
  }

  /**
   * Returns supported extensions per parser as a named map.
   */
  getSupportedFormats(): Record<string, string[]> {
    return this.parsers.reduce<Record<string, string[]>>((acc, parser) => {
      acc[parser.getName()] = parser.getSupportedExtensions();
      return acc;
    }, {});
  }
}
