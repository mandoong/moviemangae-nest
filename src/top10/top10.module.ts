import { Module } from '@nestjs/common';
import { Top10 } from './top10.entity';
import { Top10Repository } from './top10.repository';
import { Top10Controller } from './top10.controller';
import { Top10Service } from './top10.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from 'src/movie/movie.entity';
import { MovieRepository } from 'src/movie/movie.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Top10, Top10Repository, Movie, MovieRepository]),
  ],
  controllers: [Top10Controller],
  providers: [Top10Service],
})
export class Top10Module {}
