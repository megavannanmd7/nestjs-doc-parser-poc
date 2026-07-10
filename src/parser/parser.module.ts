import { Module } from '@nestjs/common';
import { UploadModule } from '../upload/upload.module';
import { ParserController } from './controllers/parser.controller';
import { MarkitdownService } from './services/markitdown.service';
import { OfficeparserService } from './services/officeparser.service';
import { ParserFactory } from './services/parser.factory';
import { BenchmarkService } from './services/benchmark.service';

@Module({
  imports: [UploadModule],
  controllers: [ParserController],
  providers: [
    MarkitdownService,
    OfficeparserService,
    ParserFactory,
    BenchmarkService,
  ],
})
export class ParserModule {}
