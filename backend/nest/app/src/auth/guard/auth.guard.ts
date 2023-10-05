import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as session from 'express-session';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor() {}
  
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
	console.log("Session Guard")
	console.log(request.session)
	console.log(request.sessionID)
    if (!request.session || !request.sessionID) {
		return false
    }
<<<<<<< HEAD
    console.log("Session Guard")
    console.log(request.sessionID)
    if (!request.sessionID || !request.session) {
      return false
    }
    console.log("Session verified")

=======
	console.log("Session END")
>>>>>>> 883eb4a452a20eae31e4275dd067eb5eb974b709
    return true
  }
}