// import { Message } from "../entities/message.entity";

import { IsNotEmpty, IsNumber, IsString } from "class-validator";

// export class CreateMessageDto extends  Message{
// }

export  class CreateMessageDto  {
    @IsNotEmpty()
    @IsNumber()
    channelId: number;

    @IsString()
    @IsNotEmpty()
    content: string;
}