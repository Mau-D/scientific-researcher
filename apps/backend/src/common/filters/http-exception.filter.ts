import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
//TODO: Améliorer la gestion des erreurs pour capturer plus de cas spécifiques
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Détermination sécurisée du statut
    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extraction sécurisée du message sans 'any'
    let message = 'Internal server error';
    
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      // Si c'est un objet (cas des erreurs de validation DTO), on prend .message, sinon le texte
      message = typeof res === 'object' && res !== null 
        ? (res as Record<string, unknown>).message as string 
        : res as string;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: message,
    });
  }
}