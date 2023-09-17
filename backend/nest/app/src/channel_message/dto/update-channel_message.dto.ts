import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelMessageDto } from './create-channel_message.dto';

export class UpdateChannelMessageDto extends PartialType(CreateChannelMessageDto) {}
