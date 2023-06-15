import { Comment } from '../comment/comment.entity';
import { MovieActorLink } from '../movie_actor_link/movie_actor_link.entity';
import { MovieLikeLink } from '../movie_like_link/movie_like_link.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToMany,
  JoinTable,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Movie extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column()
  movieId: string;

  @Column()
  title: string;

  @Column()
  contentType: string;

  @Column()
  url: string;

  @Column({
    nullable: true,
  })
  scoring: number;

  @Column()
  platform: string;

  @Column()
  presentationType: string;

  @Column()
  standardWebURL: string;

  @Column({
    nullable: true,
  })
  availableTo: Date;

  @Column({
    nullable: true,
  })
  imageUrl: string;

  @Column({
    nullable: true,
  })
  main_imageUrl: string;

  @Column({
    nullable: true,
  })
  cover_imageUrl: string;

  @Column({
    type: 'text',
  })
  dateCreated: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column()
  duration: string;

  @Column()
  director: string;

  @Column({
    type: 'text',
  })
  genre: string;

  @Column({
    default: 0,
  })
  like_count: number;

  @Column({
    default: 0,
  })
  dislike_count: number;

  @OneToMany(() => MovieLikeLink, (link) => link.movie)
  @JoinTable()
  liked_user: MovieLikeLink[];

  @OneToMany(() => MovieLikeLink, (link) => link.movie)
  @JoinTable()
  disliked_user: MovieLikeLink[];

  @OneToMany(() => Comment, (comment) => comment.comment_movie)
  @JoinColumn()
  comments: Comment[];

  @OneToMany(() => MovieActorLink, (link) => link.movie)
  @JoinColumn()
  actors: MovieActorLink[];

  @OneToMany(() => MovieLikeLink, (link) => link.movie)
  @JoinColumn()
  best_movie_user: MovieLikeLink[];

  @OneToMany(() => MovieLikeLink, (link) => link.movie)
  @JoinColumn()
  view_movie_user: MovieLikeLink[];

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
