import { Controller } from '@nestjs/common';
import { MovieActorLinkService } from './movie_actor_link.service';

@Controller('movie-actor')
export class MovieActorLinkController {
  constructor(private movieActorLinkService: MovieActorLinkService) {}
}
