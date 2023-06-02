import { Movie } from 'src/movie/movie.entity';
import { MovieLikeLink } from 'src/movie_like_link/movie_like_link.entity';
import { User } from 'src/user/user.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToMany,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  movie_id: number;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn()
  user: User;

  @Column({
    type: 'text',
    nullable: false,
  })
  content: string;

  @Column({
    default: 0,
  })
  like: number;

  @Column({
    default: 0,
  })
  report: number;

  @OneToMany(() => Comment, (comment) => comment.parent)
  @JoinColumn()
  children: Comment[];

  @ManyToOne(() => Comment, (comment) => comment.children)
  @JoinColumn()
  parent: Comment;

  @Column({
    default: 0,
  })
  depth: number;

  @OneToMany(() => MovieLikeLink, (movieLikeLink) => movieLikeLink.likeComment)
  @JoinColumn()
  like_user: MovieLikeLink;

  @ManyToOne(() => Movie, (movie) => movie.comments)
  @JoinColumn()
  comment_movie: Movie;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
