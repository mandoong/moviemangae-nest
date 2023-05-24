import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './movie.entity';
import { MovieActorLink } from 'src/movie_actor_link/movie_actor_link.entity';
import { MovieLikeLink } from 'src/movie_like_link/movie_like_link.entity';
import { MovieRepository } from './movie.repository';
import { MovieLikeLinkRepository } from 'src/movie_like_link/movie_like_link.repository';
import { MovieActorLinkRepository } from 'src/movie_actor_link/movie_actor_link.repository';

const axios = require('axios');
const { parse } = require('node-html-parser');

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: MovieRepository,

    @InjectRepository(MovieActorLink)
    private movieActorLinkRepository: MovieActorLinkRepository,

    @InjectRepository(MovieLikeLink)
    private movieLikeLinkRepository: MovieLikeLinkRepository, // @InjectRepository(Actor) // private actorRepository: ActorRepository,
  ) {}

  async getAllMovie() {
    const result = await this.movieRepository
      .createQueryBuilder('movie')
      .take(100)
      .select([
        'movie.id',
        'movie.title',
        'movie.platform',
        'movie.imageUrl',
        'movie.contentType',
        'movie.scoring',
        'movie.presentationType',
        'movie.availableTo',
        'movie.dateCreated',
        'movie.genre',
        'movie.main_imageUrl',
        'movie.created_at',
        'movie.updated_at',
        'movie.like_count',
      ])
      .getMany();

    return result;
  }

  async getMovieSelect(skip: number, platform: string[] = []) {
    const result = await this.movieRepository.find({
      where: platform.map((platform) => {
        return {
          platform: platform,
        };
      }),
      skip: skip,
      take: 20,
    });

    return result;
  }

  async getMovieOne(id: number) {
    const result = await this.movieRepository.findOne({
      where: { id: id },
      relations: { comments: true },
    });

    const actors = await this.movieActorLinkRepository.find({
      where: { movie_id: id },
    });

    result.actors = actors;

    return result;
  }

  async getMovieByPlatform(platform: string) {
    const result = await this.movieRepository.find({
      where: { platform: platform },
    });

    return [result.length, result];
  }

  async likeMovies(id: number, user_id: number) {
    const result = await this.movieLikeLinkRepository.findOne({
      where: {
        movie_id: id,
        user_id: user_id,
      },
    });

    if (result) {
      throw new BadRequestException('이미 좋아요 하였습니다.');
    }

    const movie = await this.movieRepository.findOne({ where: { id: id } });

    movie.like_count = movie.like_count + 1;
    await this.movieRepository.save(movie);

    const link = new MovieLikeLink();
    link.movie_id = id;
    link.user_id = user_id;
    await this.movieLikeLinkRepository.save(link);

    return movie;
  }

  async cancelLikeMovie(id: number, user_id: number) {
    const result = await this.movieLikeLinkRepository.findOne({
      where: {
        movie_id: id,
        user_id: user_id,
      },
    });

    if (!result) {
      throw new BadRequestException('해당 유저는 좋아요를 하지 않았습니다.');
    }

    await this.movieLikeLinkRepository.delete(result.id);

    const movie = await this.movieRepository.findOne({ where: { id: id } });

    if (movie.like_count >= 0) {
      movie.like_count = movie.like_count - 1;
    } else {
      throw new BadRequestException();
    }

    await this.movieRepository.save(movie);
    return movie;
  }
}
