import { Repository } from 'typeorm';
import { Movie } from './movie.entity';

export class MovieRepository extends Repository<Movie> {}
