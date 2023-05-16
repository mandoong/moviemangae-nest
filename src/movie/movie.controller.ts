import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from './movie.entity';

@Controller('movie')
export class MovieController {
  constructor(private movieService: MovieService) {}

  @Get('/')
  getAllMovie(): Promise<Movie[]> {
    return this.movieService.getAllMovie();
  }

  @Post('/select')
  getMovieSelect(
    @Body('platform') platform: string[],
    @Body('skip') skip: number,
  ): Promise<Movie[]> {
    return this.movieService.getMovieSelect(skip, platform);
  }

  @Get('/:id')
  getMovieByPlatform(@Param('id') id: string) {
    return this.movieService.getMovieByPlatform(id);
  }

  @Get('/:id/like/:user_id')
  likeMovie(@Param('id') id: number, @Param('user_id') user_id: number) {
    return this.movieService.likeMovies(id, user_id);
  }

  @Delete('/:id/like/:user_id')
  cancelLikeMovie(@Param('id') id: number, @Param('user_id') user_id: number) {
    return this.movieService.cancelLikeMovie(id, user_id);
  }
}
