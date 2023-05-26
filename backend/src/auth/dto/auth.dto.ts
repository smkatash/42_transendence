import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class OAuthDto    {
    @IsEmail()
    @IsNotEmpty()
    email:  string
    @IsString()
    @IsNotEmpty()
    intra:  string
}
/*
export class AuthDto extends OAuthDto   {
    @IsString()
    @IsNotEmpty()
    hash: string
}
*/