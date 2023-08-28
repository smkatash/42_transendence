import { createParamDecorator, ExecutionContext, UnauthorizedException,} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

export const GetUser = createParamDecorator(
    (_data, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest()
    if  (!request.user) {
        throw new UnauthorizedException()
    }

    return request.user
})