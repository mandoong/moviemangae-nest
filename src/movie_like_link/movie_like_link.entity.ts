import { Comment } from '../comment/comment.entity';
import { Movie } from '../movie/movie.entity';
import { User } from '../user/user.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

@Entity()
export class MovieLikeLink extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @ManyToOne(() => Movie, (movie) => movie.liked_user)
  movie: Movie;

  @ManyToOne(() => Comment, (comment) => comment.liked_user)
  comment: Comment;

  @ManyToOne(() => User, (user) => user.liked_movie)
  user: User;

  @Column()
  type: string;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
