import {
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { User } from '../../user/user.entity';

export class CommentCreateDto {
  @IsNumber()
  movie_id: number;

  @IsNumber()
  depth: number;

  @IsNumber()
  parent_id: number;

  @IsString()
  @MinLength(10)
  content: string;
}
