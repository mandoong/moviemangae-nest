import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieActorLink } from './movie_actor_link.entity';
import { MovieActorLinkRepository } from './movie_actor_link.repository';
import { MovieRepository } from 'src/movie/movie.repository';
import { ActorRepository } from 'src/actor/actor.repository';
import { Movie } from 'src/movie/movie.entity';
import { Actor } from 'src/actor/actor.entity';

@Injectable()
export class MovieActorLinkService {
  constructor(
    @InjectRepository(MovieActorLink)
    private movieActorLinkRepository: MovieActorLinkRepository,

    @InjectRepository(Actor)
    private actorRepository: ActorRepository,
  ) {}

  getActor() {}
}
