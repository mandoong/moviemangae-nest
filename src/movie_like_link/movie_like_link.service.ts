import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieLikeLink } from './movie_like_link.entity';
import { MovieLikeLinkRepository } from './movie_like_link.repository';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class MovieLikeLinkService {
  constructor(
    @InjectRepository(MovieLikeLink)
    private movieLikeLinkRepository: MovieLikeLinkRepository,

    @InjectRepository(MovieLikeLink)
    private userRepository: UserRepository,
  ) {}

  async MovieLikeUser() {
    const result = await this.movieLikeLinkRepository
      .createQueryBuilder('movieLikeLink')
      .select(['movieLikeLink.id', 'movie.actor'])
      .getMany();
  }
}
