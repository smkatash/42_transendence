import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class createChannelDto    {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    private: boolean;

    @IsString()
    password: string;

    @IsString()
    topic: string;
}