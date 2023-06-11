import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actor } from './actor.entity';
import { ActorRepository } from './actor.repository';
import { MovieActorLink } from '../movie_actor_link/movie_actor_link.entity';
import { MovieActorLinkRepository } from '../movie_actor_link/movie_actor_link.repository';
import { ActorController } from './actor.controller';
import { ActorService } from './actor.service';
import { MovieActorLinkController } from '../movie_actor_link/movie_actor_link.controller';
import { MovieActorLinkService } from '../movie_actor_link/movie_actor_link.service';
import { CrawlerService } from '../crawler/crawler.service';
import { CrawlerRepository } from '../crawler/crawler.repository';
import { Crawler } from '../crawler/crawler.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Actor,
      ActorRepository,
      MovieActorLink,
      MovieActorLinkRepository,
    ]),
  ],

  controllers: [ActorController],
  providers: [ActorService],
})
export class ActorModule { }
