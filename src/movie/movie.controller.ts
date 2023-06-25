import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Patch,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from './movie.entity';
import { MovieSearchDto } from './dto/movie.search.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('movies')
export class MovieController {
  constructor(private movieService: MovieService) {}

  @Get('/all')
  getAllMovie(@Query('page') page: number): Promise<Movie[]> {
    return this.movieService.getAllMovie(page);
  }

  @Get('/find/:id')
  @UseGuards(AuthGuard())
  getMovieById(@Param('id') id: number) {
    return this.movieService.getMovieOne(id);
  }

  @Get('/search')
  getSearchMovie(@Query('word') word: string) {
    return this.movieService.searchMovie(word);
  }

  @Get('/favorite')
  getFavoriteMovies() {
    return this.movieService.getFavoriteMovies();
  }

  @Get('/deadline')
  getDeadlineMovies() {
    return this.movieService.getDeadlineMovies();
  }

  @Get('/count')
  getMovieCount() {
    return this.movieService.getMovieCount();
  }

  @Post('/select')
  getMovieSelect(@Body('dto') dto: MovieSearchDto): Promise<Movie[]> {
    return this.movieService.getMovieSelect(dto);
  }

  @Post('/:id/like/')
  @UseGuards(AuthGuard())
  addMyMovieList(
    @Param('id') id: number,
    @Req() req: Request,
    @Body('type') type: string,
  ) {
    return this.movieService.addMyMovieList(id, req, type);
  }

  @Delete('/:id/like')
  @UseGuards(AuthGuard())
  removeMyMovieList(
    @Param('id') id: number,
    @Req() req: Request,
    @Body('type') type: string,
  ) {
    return this.movieService.removeMyMovieList(id, req, type);
  }
}
