import { Module } from '@nestjs/common';
import { MovieController } from 'src/movie/movie.controller';
import { Movie } from 'src/movie/movie.entity';
import { MovieRepository } from 'src/movie/movie.repository';
import { MovieService } from 'src/movie/movie.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { CrawlerRepository } from './crawler.repository';
import { Crawler } from './crawler.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Crawler,
      Movie,
      CrawlerRepository,
      MovieRepository,
    ]),
  ],
  controllers: [CrawlerController],
  providers: [CrawlerService, CrawlerRepository, MovieRepository],
})
export class CrawlerModule {}
