import { createParamDecorator, ExecutionContext, UnauthorizedException,} from '@nestjs/common';

export interface SessionParams {
    id: string,
    session: Object
}

export const GetSession = createParamDecorator(
    (_data, context: ExecutionContext): SessionParams => {
    const request = context.switchToHttp().getRequest()
    console.log('Getting session')
    console.log(request.session)
    console.log(request.sessionID)
    
    if  (!request.session || !request.sessionID) {
        throw new UnauthorizedException()
    }
    return {
        id: request.sessionID,
        session: request.session
    }
})