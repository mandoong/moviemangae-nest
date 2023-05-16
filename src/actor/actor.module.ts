import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actor } from './actor.entity';
import { ActorRepository } from './actor.repository';
import { MovieActorLink } from 'src/movie_actor_link/movie_actor_link.entity';
import { MovieActorLinkRepository } from 'src/movie_actor_link/movie_actor_link.repository';
import { ActorController } from './actor.controller';
import { ActorService } from './actor.service';
import { MovieActorLinkController } from 'src/movie_actor_link/movie_actor_link.controller';
import { MovieActorLinkService } from 'src/movie_actor_link/movie_actor_link.service';
import { CrawlerService } from 'src/crawler/crawler.service';
import { CrawlerRepository } from 'src/crawler/crawler.repository';
import { Crawler } from 'src/crawler/crawler.entity';

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
export class ActorModule {}
