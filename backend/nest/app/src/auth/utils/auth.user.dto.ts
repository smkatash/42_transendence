import { IsBoolean, IsEnum, IsString} from "class-validator"
import { Status } from "src/user/utils/status.dto"


export class AuthUserDto {
    @IsString()
    id: string
    @IsString()
    username: string
    @IsString()
    title: string
    @IsString()
    avatar: string
    @IsEnum(Status)
    status: Status
}
