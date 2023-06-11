import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieActorLink } from './movie_actor_link.entity';
import { MovieActorLinkRepository } from './movie_actor_link.repository';
import { MovieActorLinkController } from './movie_actor_link.controller';
import { MovieActorLinkService } from './movie_actor_link.service';
import { CrawlerController } from '../crawler/crawler.controller';
import { Crawler } from '../crawler/crawler.entity';
import { CrawlerRepository } from '../crawler/crawler.repository';
import { CrawlerService } from '../crawler/crawler.service';
import { Movie } from '../movie/movie.entity';
import { MovieRepository } from '../movie/movie.repository';
import { MovieController } from '../movie/movie.controller';
import { MovieService } from '../movie/movie.service';
import { Actor } from '../actor/actor.entity';
import { ActorRepository } from '../actor/actor.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovieActorLink,
      MovieActorLinkRepository,
      Actor,
      ActorRepository,
    ]),
  ],
  controllers: [MovieActorLinkController],
  providers: [MovieActorLinkService],
  exports: [MovieActorLinkService],
})
export class MovieActorLinkModule { }
