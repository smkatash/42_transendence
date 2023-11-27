import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello() {
    return { text: "Nothing to search here, kindly go to pong =)" };
  }
}
