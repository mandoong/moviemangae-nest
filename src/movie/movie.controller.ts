import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from './movie.entity';
import { MovieSearchDto } from './dto/movie.search.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('movie')
export class MovieController {
  constructor(private movieService: MovieService) {}

  @Get('/')
  getAllMovie(@Query('page') page: number): Promise<Movie[]> {
    return this.movieService.getAllMovie(page);
  }

  @Get('/:id')
  @UseGuards(AuthGuard())
  getMovieById(@Param('id') id: number, @Req() req: Request) {
    return this.movieService.getMovieOne(id, req);
  }

  @Get('/search/movie')
  getSearchMovie(@Query('word') word: string) {
    return this.movieService.searchMovie(word);
  }

  @Get('/list/favorite')
  getFavoriteMovies() {
    return this.movieService.getFavoriteMovies();
  }

  @Get('/list/deadline')
  getDeadlineMovies() {
    return this.movieService.getDeadlineMovies();
  }

  @Get('/count/list')
  getMovieCount() {
    return this.movieService.getMovieCount();
  }

  @Post('/select/movie')
  getMovieSelect(@Body('dto') dto: MovieSearchDto): Promise<Movie[]> {
    return this.movieService.getMovieSelect(dto);
  }

  @Get('/platform/:id')
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
