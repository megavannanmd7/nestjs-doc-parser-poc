import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { ensureUploadDirExists } from './common/utils/file.util';
import { UPLOAD_DIR } from './common/constants/file.constants';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // ── Winston Logger ──────────────────────────────────────────────────────────
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // ── Validation ──────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // ── Pretty JSON ─────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  (app.getHttpAdapter().getInstance() as { set: (key: string, val: number) => void }).set(
    'json spaces',
    2,
  );

  // ── Swagger ─────────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Document Parser POC')
    .setDescription(
      'Benchmark MarkItDown JS vs OfficeParser — upload a document and compare extracted text side-by-side.',
    )
    .setVersion('1.0.0')
    .addTag('Parser', 'Document parsing and benchmarking endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
    },
    customSiteTitle: 'Document Parser POC — Swagger UI',
  });

  // ── Ensure uploads directory exists ──────────────────────────────────────────
  await ensureUploadDirExists(UPLOAD_DIR);

  // ── Start server ─────────────────────────────────────────────────────────────
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(`🚀 Server running on http://localhost:${port}`, 'Bootstrap');
  logger.log(`📖 Swagger UI: http://localhost:${port}/api`, 'Bootstrap');
  logger.log(`📁 Upload dir: ${UPLOAD_DIR}`, 'Bootstrap');
}

void bootstrap();
