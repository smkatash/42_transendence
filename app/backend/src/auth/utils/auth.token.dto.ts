import { IsNumber, IsString } from "class-validator";

export class AuthTokenDto {
  @IsString()
  value: string;
  @IsString()
  userId: string;
  @IsNumber()
  expires: number;
}
