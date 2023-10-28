import { Injectable, CanActivate, ExecutionContext, UseGuards } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { Status } from 'src/user/utils/status.enum';
import { MfaStatus } from '../utils/mfa-status';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor() {}
  
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
	
    if (!request.session || !request.sessionID) {
		return false
    }

	if (request.user) {
		const user: User = request.user
		if (user.status === Status.MFAPending) {
			return true
		}
		
		if (user.mfaEnabled === true) {
			return MfaStatus.VALIDATE === user.mfaStatus
		}
	}
	return true
  }
}

