import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieActorLink } from './movie_actor_link.entity';
import { MovieActorLinkRepository } from './movie_actor_link.repository';
import { MovieActorLinkController } from './movie_actor_link.controller';
import { MovieActorLinkService } from './movie_actor_link.service';
import { CrawlerController } from 'src/crawler/crawler.controller';
import { Crawler } from 'src/crawler/crawler.entity';
import { CrawlerRepository } from 'src/crawler/crawler.repository';
import { CrawlerService } from 'src/crawler/crawler.service';
import { Movie } from 'src/movie/movie.entity';
import { MovieRepository } from 'src/movie/movie.repository';
import { MovieController } from 'src/movie/movie.controller';
import { MovieService } from 'src/movie/movie.service';
import { Actor } from 'src/actor/actor.entity';
import { ActorRepository } from 'src/actor/actor.repository';

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
export class MovieActorLinkModule {}
