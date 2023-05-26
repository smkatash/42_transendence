import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
// import { Observable } from "rxjs";

@Injectable()
export class OAuth42Guard extends AuthGuard('42')   {
    // async canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    async canActivate(context: ExecutionContext){
        const activate = (await super.canActivate(context)) as boolean;
        const request = context.switchToHttp().getRequest();
        await super.logIn(request);
        return activate;
    }
}