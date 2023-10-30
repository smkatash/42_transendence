import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { User } from "src/user/entities/user.entity";

export class CreateChannelDto    {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    private: boolean;

    @IsString()
    @IsOptional()
    password: string;

    @IsString()
    topic?: string;

    // @IsString()
    @IsNotEmpty()
    type: 'private' | 'protected' | 'public' | 'direct';
}

export class ChannelToFeDto    {
    id: number;

    name: string;

    private: boolean;

    type: string;

    updatedAt: Date;

    // owner: User;

    // topic: string;

    users: User[];

    // admins: User[];

    // messages: Message[];

    protected: boolean;

    avatar?: string;

    // banned: User[]
}

export  class JoinChannelDto    {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsOptional()
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

export class ChannelPasswordDto {
    @IsNumber()
    @IsNotEmpty()
    cId: number;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    oldPass: string;
    
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    newPass: string;
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