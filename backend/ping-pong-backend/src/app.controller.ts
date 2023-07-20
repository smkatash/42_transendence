import { Controller, Get, Param, Query, Redirect } from '@nestjs/common';
import { AppService } from './app.service';


@Controller()
export class AppController {

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Query('code') code: string, @Query('state') state: string ): string {
    return this.appService.getHello(code);
  }

  @Get('/auth')
  @Redirect(api, 301)
  redirectToAuthorization(): void {
  }
}