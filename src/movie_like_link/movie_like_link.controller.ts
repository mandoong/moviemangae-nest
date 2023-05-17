import { Controller, Get } from '@nestjs/common';
import { MovieLikeLinkService } from './movie_like_link.service';

@Controller('movie-like')
export class MovieLikeLinkController {
  constructor(private movieLikeLinkService: MovieLikeLinkService) {}
}
