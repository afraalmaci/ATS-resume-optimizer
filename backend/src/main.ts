import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { parseTrustProxy } from './config/trust-proxy';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Behind a reverse proxy, use the client IP it reports (for rate limits).
  const trustProxy = parseTrustProxy(config.get<string>('TRUST_PROXY'));
  if (trustProxy) {
    app.set('trust proxy', trustProxy);
  }

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  Logger.log(`API listening on port ${port}`, 'Bootstrap');
}
void bootstrap();
