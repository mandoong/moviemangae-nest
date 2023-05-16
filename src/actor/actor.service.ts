import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Actor } from './actor.entity';
import { ActorRepository } from './actor.repository';
import { MovieActorLink } from 'src/movie_actor_link/movie_actor_link.entity';
import { MovieActorLinkRepository } from 'src/movie_actor_link/movie_actor_link.repository';

@Injectable()
export class ActorService {
  constructor(
    @InjectRepository(Actor)
    private actorRepository: ActorRepository,
  ) {}
}
