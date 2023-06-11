import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Top10 } from './top10.entity';
import { Top10Repository } from './top10.repository';
import dayjs = require('dayjs');
import { Movie } from '../movie/movie.entity';
import { MovieRepository } from '../movie/movie.repository';

@Injectable()
export class Top10Service {
  constructor(
    @InjectRepository(Top10)
    private top10Repository: Top10Repository,

    @InjectRepository(Movie)
    private movieRepository: MovieRepository,
  ) { }

  async getTop10Today() {
    const today = dayjs().add(-1, 'day').format('YYYY-MM-DD');

    const top10 = await this.top10Repository.findOne({
      where: { date: today },
    });
    const result = [];
    if (top10) {
      const movies = JSON.parse(top10.movie_id);

      while (movies.length > 0) {
        const q = movies.shift();
        const movie = await this.movieRepository.findOne({
          where: { movieId: q },
        });
        if (movie) {
          result.push(movie);
        }
      }
    }

    return result;
  }
}
