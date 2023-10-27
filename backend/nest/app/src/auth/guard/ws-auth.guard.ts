import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";
import { Status } from "src/user/utils/status.enum";
import { MfaStatus } from "../utils/mfa-status";

@Injectable()
export class WsAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient()
    const request = client.request
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