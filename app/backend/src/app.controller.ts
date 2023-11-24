import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get()
  getHello() {
    console.log("hello endpoint");
    return this.appService.getHello();
  }
}
