import { Comment } from 'src/comment/comment.entity';
import { Movie } from 'src/movie/movie.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class MovieLikeLink extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column()
  movie_id: number;

  @Column()
  comment_id: number;

  @Column()
  user_id: number;

  @Column()
  Type: string;

  // @ManyToOne(() => Movie, (movie) => movie.like_user)
  // @JoinColumn()
  // likeMovie: Movie[];

  // @ManyToOne(() => Comment, (comment) => comment.like_user)
  // @JoinColumn()
  // likeComment: Comment[];

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
