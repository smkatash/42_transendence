import { PartialType } from '@nestjs/mapped-types';
import { CreateBlockListDto } from './create-block_list.dto';

export class UpdateBlockListDto extends PartialType(CreateBlockListDto) {}
