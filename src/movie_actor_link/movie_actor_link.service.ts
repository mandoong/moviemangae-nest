import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieActorLink } from './movie_actor_link.entity';
import { MovieActorLinkRepository } from './movie_actor_link.repository';
import { MovieRepository } from '../movie/movie.repository';
import { ActorRepository } from '../actor/actor.repository';
import { Movie } from '../movie/movie.entity';
import { Actor } from '../actor/actor.entity';

@Injectable()
export class MovieActorLinkService {
  constructor(
    @InjectRepository(MovieActorLink)
    private movieActorLinkRepository: MovieActorLinkRepository,

    @InjectRepository(Actor)
    private actorRepository: ActorRepository,
  ) { }

  getActor() { }
}
