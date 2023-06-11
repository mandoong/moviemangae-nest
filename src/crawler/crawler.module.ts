import { Module } from '@nestjs/common';
import { MovieController } from '../movie/movie.controller';
import { Movie } from '../movie/movie.entity';
import { MovieRepository } from '../movie/movie.repository';
import { MovieService } from '../movie/movie.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { CrawlerRepository } from './crawler.repository';
import { Crawler } from './crawler.entity';
import { Actor } from '../actor/actor.entity';
import { ActorRepository } from '../actor/actor.repository';
import { MovieActorLink } from '../movie_actor_link/movie_actor_link.entity';
import { MovieActorLinkRepository } from '../movie_actor_link/movie_actor_link.repository';
import { Top10 } from '../top10/top10.entity';
import { Top10Repository } from '../top10/top10.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Crawler,
      Movie,
      Actor,
      MovieActorLink,
      CrawlerRepository,
      MovieRepository,
      ActorRepository,
      MovieActorLinkRepository,
      Top10,
      Top10Repository,
    ]),
  ],
  controllers: [CrawlerController],
  providers: [CrawlerService],
})
export class CrawlerModule { }
