import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './movie.entity';
import { MovieActorLink } from 'src/movie_actor_link/movie_actor_link.entity';
import { MovieLikeLink } from 'src/movie_like_link/movie_like_link.entity';
import { MovieRepository } from './movie.repository';
import { MovieLikeLinkRepository } from 'src/movie_like_link/movie_like_link.repository';
import { MovieActorLinkRepository } from 'src/movie_actor_link/movie_actor_link.repository';
import { Between, Brackets, ILike, Not } from 'typeorm';
import { MovieSearchDto } from './dto/movie.search.dto';
import { User } from 'src/user/user.entity';
import { UserRepository } from 'src/user/user.repository';
import { Request } from 'express';

const axios = require('axios');
const { parse } = require('node-html-parser');

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: MovieRepository,

    @InjectRepository(MovieActorLink)
    private movieActorLinkRepository: MovieActorLinkRepository,

    @InjectRepository(User)
    private userRepository: UserRepository,

    @InjectRepository(MovieLikeLink)
    private movieLikeLinkRepository: MovieLikeLinkRepository, // @InjectRepository(Actor) // private actorRepository: ActorRepository,
  ) {}

  async getMovieCount() {
    const result = this.movieRepository.count();

    return result;
  }

  async getAllMovie(page: number = 0) {
    const result = await this.movieRepository
      .createQueryBuilder('movie')
      .skip(page * 50)
      .take(50)
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

  async getMovieSelect(movieDto: MovieSearchDto) {
    const {
      page,
      platform = [],
      like,
      genre = [],
      scoring = [0, 10],
      duration,
      dataCreated,
      presentationType = [],
    } = movieDto;
    const qb = this.movieRepository.createQueryBuilder('movie');

    const sortScoring = scoring.sort((a, b) => a - b);

    if (platform.length > 0) {
      qb.andWhere(
        new Brackets((qb) => {
          platform.forEach((i) => {
            qb.orWhere(`movie.platform = "${i}"`);
          });
        }),
      );
    }

    if (presentationType.length > 0) {
      qb.andWhere(
        new Brackets((qb) => {
          presentationType.forEach((i) => {
            qb.orWhere(`movie.presentationType = "${i}"`);
          });
        }),
      );
    }

    if (genre.length > 0) {
      qb.andWhere(
        new Brackets((qb) => {
          for (const i of genre) {
            qb.orWhere(`movie.genre LIKE "%${i}%"`);
          }
        }),
      );
    }

    if (sortScoring) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.orWhere(
            'movie.scoring >= :minValue AND movie.scoring <= :maxValue',
            { minValue: scoring[0], maxValue: scoring[1] },
          );
        }),
      );
    }

    if (duration) {
      qb.andWhere(
        "TIME_TO_SEC(REPLACE(movie.duration, 'T', '')) <= TIME_TO_SEC(:duration)",
        { duration },
      );
    }

    const result = await qb
      .skip(page * 30)
      .take(30)
      .orderBy({ 'movie.id': 'ASC' })
      .getMany();

    return result;
  }

  async getMovieOne(id: number, req) {
    // const result = await this.movieRepository.findOne({
    //   where: { id: id },
    //   relations: ['comments', 'comments.user', 'comments.children'],
    // });
    const userId = req.user.id;

    const result = await this.movieRepository
      .createQueryBuilder('movie')
      .where(`movie.id = '${id}'`)
      .leftJoinAndSelect('movie.like_user', 'like_user')
      .leftJoinAndSelect('movie.comments', 'comments', `comments.depth = 0 `)
      .leftJoinAndSelect('comments.user', 'user')
      .leftJoinAndSelect('comments.children', 'children')
      .getOne();

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

  async likeMovies(id: number, req) {
    const movie = await this.movieRepository.findOne({
      where: { id: id },
      relations: { like_user: true },
    });

    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
    });

    if (movie.like_user.find((e) => e.id === user.id)) {
      throw new BadRequestException('이미 좋아요 하셧습니다');
    }

    movie.like_user.push(user);
    await this.movieRepository.save(movie);

    const newUser = await this.userRepository.findOne({
      where: { id: req.user.id },
      relations: { likeMovie: true },
    });

    const newMovie = await this.movieRepository.findOne({ where: { id: id } });

    newUser.likeMovie.push(newMovie);
    await this.userRepository.save(newUser);

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

  async searchMovie(word: string) {
    if (!word) {
      return [];
    }

    const result = await this.movieRepository.find({
      where: [
        {
          title: ILike(`%${word}%`),
        },
      ],

      order: {
        scoring: 'DESC',
        dateCreated: 'DESC',
      },
    });

    return result;
  }

  async getDeadlineMovies() {
    const currentDate = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const result = this.movieRepository.find({
      where: {
        availableTo: Between(oneMonthAgo, currentDate),
      },
    });

    return result;
  }

  async getFavoriteMovies() {
    const result = this.movieRepository.find({
      order: {
        like_count: 'DESC',
      },

      take: 10,
    });

    return result;
  }
}
