import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
  console.log(`Orchestraiq API listening on http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error("Failed to start Orchestraiq API", error);
  process.exit(1);
});
