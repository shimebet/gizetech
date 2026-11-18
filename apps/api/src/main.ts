import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
  });

  const port = Number(process.env.PORT ?? 3100);

  await app.listen(port, '0.0.0.0');

  console.log(
    `Gize Tech API running on http://localhost:${port}/api/v1`,
  );
}

await bootstrap();
