import { IsBoolean, IsString} from "class-validator"


export class AuthUserDto {
    @IsString()
    id: string
    @IsString()
    username: string
    @IsString()
    email: string
    @IsString()
    avatar: string
    @IsBoolean()
    status: boolean
}