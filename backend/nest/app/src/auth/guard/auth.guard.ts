import { Injectable, CanActivate, ExecutionContext, UseGuards } from '@nestjs/common';
import * as session from 'express-session';
import { User } from 'src/user/entities/user.entity';

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
	
	if (request.user) {
		const user: User = request.user
		if (user.mfa) {
			return user.mfaVerified
		}
	}
	return true
  }
}