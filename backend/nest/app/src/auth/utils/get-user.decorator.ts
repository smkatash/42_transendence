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

export const GetWsUser = createParamDecorator(
    (_data, context: ExecutionContext)	=> {
		const client = context.switchToWs().getClient()
		console.log(client)
		const user = client.request.user;

		if  (!user) {
			throw new UnauthorizedException()
		}
	
		return user
})
