import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

let server: Handler;

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.use(cookieParser());
//   const configServer = app.get(ConfigService);
//   const port = configServer.get('NODE_SERVER_PORT');
//   app.enableCors({
//     origin: [
//       'http://localhost:5173',
//       'http://127.0.0.1:5173',
//       'http://localhost:5174',
//       'http://127.0.0.1:5174',
//     ],
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     credentials: true,
//   });
//   await app.listen(port);
// }
// bootstrap();

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'https://moviemangae-front-git-develop-mandoong.vercel.app',
      '*',
    ],
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Authorization'],
    credentials: false,
  });
  app.use(cookieParser());
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
