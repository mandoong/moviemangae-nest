import { Movie } from 'src/movie/movie.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class MovieActorLink extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column()
  movie_id: number;

  @Column()
  name: string;

  @Column()
  actor_id: number;

  @Column({
    type: 'text',
  })
  character: string;

  @ManyToOne(() => Movie, (movie) => movie.actors)
  @JoinColumn()
  movies: Movie;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
