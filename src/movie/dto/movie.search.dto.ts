import {
  IsArray,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class MovieSearchDto {
  @IsNumber()
  page: number;

  @IsArray()
  platform: string[];

  @IsString()
  like: string;

  @IsString()
  genre: string[];

  @IsArray()
  scoring: number[];

  @IsString()
  duration: string;

  @IsString()
  dataCreated: Date;

  @IsString()
  presentationType: string[];

  @IsString()
  sort: string[];
}
