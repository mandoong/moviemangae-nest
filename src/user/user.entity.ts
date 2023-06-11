import { Comment } from '../comment/comment.entity';
import { Movie } from '../movie/movie.entity';
import { MovieLikeLink } from '../movie_like_link/movie_like_link.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @OneToMany(() => MovieLikeLink, (link) => link.user)
  @JoinTable()
  liked_movie: MovieLikeLink[];

  @OneToMany(() => MovieLikeLink, (link) => link.user)
  @JoinTable()
  disliked_movie: MovieLikeLink[];

  @OneToMany(() => Comment, (comment) => comment.user)
  @JoinColumn()
  comments: Comment[];

  @OneToMany(() => MovieLikeLink, (link) => link.user)
  @JoinColumn()
  liked_comments: MovieLikeLink[];

  @OneToMany(() => MovieLikeLink, (link) => link.user)
  @JoinTable()
  best_movies: MovieLikeLink[];

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
