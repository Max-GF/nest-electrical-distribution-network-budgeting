import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { EnvService } from "./env/env.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "debug", "error", "fatal", "verbose", "warn"], // For production, set to false
  });

  const config = new DocumentBuilder()
    .setTitle("Base NestJS Start Project")
    .setDescription("Some base stuffs to start a NestJS project")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const configService = app.get(EnvService);
  const port = configService.get("PORT");
  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}
bootstrap();
