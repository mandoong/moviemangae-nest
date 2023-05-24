import {
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { User } from 'src/user/user.entity';

export class CommentCreateDto {
  @IsNumber()
  movie_id: number;

  @IsNumber()
  depth: number;

  @IsNumber()
  parent_id: number;

  @IsString()
  content: string;
}
