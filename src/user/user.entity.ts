import { Comment } from 'src/comment/comment.entity';
import { Movie } from 'src/movie/movie.entity';
import { MovieLikeLink } from 'src/movie_like_link/movie_like_link.entity';
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

  @ManyToMany(() => Movie, (movie) => movie.like_user)
  @JoinTable()
  likeMovie: Movie[];

  @OneToMany(() => Comment, (comment) => comment.user)
  @JoinColumn()
  comments: Comment[];

  @ManyToMany(() => Comment, (comment) => comment.liked_user)
  @JoinColumn()
  liked_comments: Comment[];

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
