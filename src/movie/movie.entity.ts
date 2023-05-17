import { Actor } from 'src/actor/actor.entity';
import { MovieActorLink } from 'src/movie_actor_link/movie_actor_link.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToMany,
  JoinTable,
  JoinColumn,
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
    type: 'text',
    default: '',
  })
  scoring: string;

  @Column()
  platform: string;

  @Column()
  presentationType: string;

  @Column()
  standardWebURL: string;

  @Column()
  availableTo: string;

  @Column({
    type: 'text',
  })
  actor: string;

  @Column()
  imageUrl: string;

  @Column({
    type: 'text',
  })
  dateCreated: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'text',
  })
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

  @ManyToMany(() => MovieActorLink)
  @JoinColumn()
  actors: MovieActorLink[];

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
