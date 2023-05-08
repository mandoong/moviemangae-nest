import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { MovieRepository } from './movie.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './movie.entity';
import { CrawlerService } from 'src/crawler/crawler.service';
import { CrawlerController } from 'src/crawler/crawler.controller';
import { CrawlerRepository } from 'src/crawler/crawler.repository';
import { Crawler } from 'src/crawler/crawler.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movie,
      Crawler,
      MovieRepository,
      CrawlerRepository,
    ]),
  ],
  controllers: [MovieController, CrawlerController],
  providers: [MovieService, MovieRepository, CrawlerService, CrawlerRepository],
})
export class MovieModule {}
