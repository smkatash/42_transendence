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
    console.log("Session verified")

    return true
  }
}