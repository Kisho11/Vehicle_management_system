import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enables Cross-Origin Resource Sharing
  // Allows the API to be accessed from different domains
  app.enableCors();
  
  // Use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,      // Strips properties not defined in DTOs
      transform: true,      // Automatically transforms payloads to DTO instances
      forbidNonWhitelisted: true,  // Throws error if non-whitelisted properties are present
    }),
  );
  
  // Adds 'api' prefix to all routes
  app.setGlobalPrefix('api');
  

//   Gets ConfigService instance
// Retrieves PORT from environment variables, defaults to 3000
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3005);
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();

