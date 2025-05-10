import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Enable CORS
  app.enableCors();
  
  // Prisma shutdown hook
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Kutubxona Boshqaruv Tizimi')
    .setDescription('Kutubxona tizim API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();