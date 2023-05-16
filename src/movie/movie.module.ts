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
import { ActorModule } from 'src/actor/actor.module';
import { ActorRepository } from 'src/actor/actor.repository';
import { Actor } from 'src/actor/actor.entity';
import { ActorService } from 'src/actor/actor.service';
import { MovieActorLinkRepository } from 'src/movie_actor_link/movie_actor_link.repository';
import { MovieActorLinkService } from 'src/movie_actor_link/movie_actor_link.service';
import { MovieActorLink } from 'src/movie_actor_link/movie_actor_link.entity';
import { MovieLikeLinkService } from 'src/movie_like_link/movie_like_link.service';
import { MovieActorLinkModule } from 'src/movie_actor_link/movie_actor_link.module';
import { MovieLikeLinkModule } from 'src/movie_like_link/movie_like_link.module';
import { MovieLikeLink } from 'src/movie_like_link/movie_like_link.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movie,
      MovieRepository,
      MovieActorLink,
      MovieActorLinkRepository,
      MovieLikeLink,
      MovieActorLinkRepository,
    ]),
    MovieActorLinkModule,
    MovieLikeLinkModule,
  ],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
