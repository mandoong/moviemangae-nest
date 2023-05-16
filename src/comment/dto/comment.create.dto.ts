import {
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CommentCreateDto {
  @IsNumber()
  movie_id: number;

  @IsNumber()
  user_id: number;

  @IsNumber()
  depth: number;

  @IsNumber()
  parent_id: number;

  @IsString()
  content: string;
}
