import { IsNotEmpty, IsString } from 'class-validator';

export class ImportFileDto {
  @IsNotEmpty()
  @IsString()
  fileType: string;
}