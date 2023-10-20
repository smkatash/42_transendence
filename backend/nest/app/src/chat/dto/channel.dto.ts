import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateChannelDto    {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    private: boolean;

    @IsString()
    password?: string;

    @IsString()
    topic?: string;
}

export class PublicChannelDto   {
    @IsString()
    @IsNotEmpty()
    name: string
}

export  class JoinChannelDto    {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    password: string;
}
export class    UpdateChannelDto    {
    @IsNumber()
    @IsNotEmpty()
    cId: number;

    @IsString()
    @IsNotEmpty()
    uId: string;

}