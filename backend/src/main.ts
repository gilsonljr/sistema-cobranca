import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('API Documentação')
    .setDescription('Documentação da API do projeto')
    .setVersion('1.0')
    .addTag('autenticação')
    .addTag('usuários')
    // Adicione outros tags conforme necessário para categorizar seus endpoints
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token', // Nome para referência nas anotações @ApiBearerAuth()
    )
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Mantém as credenciais entre recarregamentos
    },
  });
  await app.listen(process.env.PORT ?? 3100);
}
bootstrap();
