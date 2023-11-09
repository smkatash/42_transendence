import { Injectable, CanActivate, ExecutionContext, UseGuards } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { Status } from 'src/user/utils/status.enum';
import { MfaStatus } from '../utils/mfa-status';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private userService: UserService) {}
  
  async canActivate(context: ExecutionContext) {

	try {
		const request = context.switchToHttp().getRequest();
		if (!request.session || !request.sessionID) {
			return false
		}
		
		if (request.user) {
			const user: User = request.user
			
			if (user.mfaEnabled === true) {
				if (user.mfaStatus === MfaStatus.MFAPending) {
					return true
				}
				return MfaStatus.VALIDATE === user.mfaStatus
			}
		}
		return true
	} catch (error) {
		console.error("Session Guard: " + error)
		return false
	}
  }
}

