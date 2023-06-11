import { Actor } from '../actor/actor.entity';
import { Movie } from '../movie/movie.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class MovieActorLink extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @ManyToOne(() => Movie, (movie) => movie.actors)
  movie: Movie;

  @ManyToOne(() => Actor, (actor) => actor.movies)
  actor: Actor;

  @Column({ type: 'text' })
  character: string;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
