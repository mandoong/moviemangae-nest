import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configServer = app.get(ConfigService);
  const port = configServer.get('NODE_SERVER_PORT');
  await app.listen(port);
}
bootstrap();
