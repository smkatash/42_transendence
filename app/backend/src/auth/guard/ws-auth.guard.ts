import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";
import { MfaStatus } from "../utils/mfa-status";

@Injectable()
export class WsAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    try {
      const client = context.switchToWs().getClient();
      const request = client.request;
      if (!request.session || !request.sessionID) {
        return false;
      }

      if (request.user) {
        const user: User = request.user;
        if (user.mfaEnabled === true) {
          if (user.mfaStatus === MfaStatus.MFAPending) {
            return true;
          }
          return MfaStatus.VALIDATE === user.mfaStatus;
        }
      }
      return true;
    } catch (error) {
      console.error("WsSession Guard: " + error);
      return false;
    }
  }
}
