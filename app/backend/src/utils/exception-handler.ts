import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    
    console.log(exception)

    if (exception instanceof HttpException && exception.getStatus() === HttpStatus.INTERNAL_SERVER_ERROR) {
		response.status(418).json({
			statusCode: 418,
			message: 'I am a teapot', 
		})
    } else  if (exception instanceof HttpException && exception.getStatus() !== HttpStatus.INTERNAL_SERVER_ERROR) {
		super.catch(exception, host);
    } else {
      response.status(418).json({
        statusCode: 418,
        message: 'I am a teapot',  
      })
    }
  }
}