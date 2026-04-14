import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateChatDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  imgSrc?: string;

  @IsArray()
  @IsUUID('all', { each: true })
  memberIds!: string[];
}
