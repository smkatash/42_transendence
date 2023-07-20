import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(code: string): string {
    console.log(code)
    return 'Hello World!';
  }

}
