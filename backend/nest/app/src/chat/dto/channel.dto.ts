import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsString, isNumber } from "class-validator";

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

// export class PublicChannelDto   {
//     @IsString()
//     @IsNotEmpty()
//     name: string
// }

export  class JoinChannelDto    {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    password?: string;
}
export class    UpdateChannelDto    {
    @IsNumber()
    @IsNotEmpty()
    cId: number;

    @IsString()
    @IsNotEmpty()
    uId: string;
}

export class ChannelPasswordDto {
    @IsNumber()
    @IsNotEmpty()
    cId: number;

    @IsString()
    @IsNotEmpty()
    oldPass?: string;
    
    @IsString()
    @IsNotEmpty()
    newPass?: string;
}

export class uIdDto {
    @IsString()
    @IsNotEmpty()
    uId: string;
}

export class cIdDto {
    @IsNumber()
    @IsNotEmpty()
    @IsInt()
    cId: number;
}

export class PrivMsgDto {
    @IsString()
    @IsNotEmpty()
    uId: string;

    @IsString()
    @IsNotEmpty()
    text: string; 
}