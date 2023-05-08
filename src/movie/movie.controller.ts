import { Controller, Get, Param } from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from './movie.entity';

@Controller('movie')
export class MovieController {
  constructor(private movieService: MovieService) {}

  @Get('/')
  getAllUser(): Promise<Movie[]> {
    return this.movieService.getMovie();
  }

  @Get('/:id')
  getMovieByPlatform(@Param('id') id: string) {
    return this.movieService.getMovieByPlatform(id);
  }
}
