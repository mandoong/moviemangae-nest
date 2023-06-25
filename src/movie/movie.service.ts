import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './movie.entity';
import { MovieActorLink } from '../movie_actor_link/movie_actor_link.entity';
import { MovieLikeLink } from '../movie_like_link/movie_like_link.entity';
import { MovieRepository } from './movie.repository';
import { MovieLikeLinkRepository } from '../movie_like_link/movie_like_link.repository';
import { MovieActorLinkRepository } from '../movie_actor_link/movie_actor_link.repository';
import { Between, Brackets, ILike, Not } from 'typeorm';
import { MovieSearchDto } from './dto/movie.search.dto';
import { User } from '../user/user.entity';
import { UserRepository } from '../user/user.repository';
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

  async getAllMovie(page = 0) {
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
      sort = 'dataCreated',
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
      .orderBy({ [`movie.${sort}`]: 'DESC', 'movie.created_at': 'DESC' })
      .getMany();

    return result;
  }

  async getMovieOne(id: number) {
    const result = await this.movieRepository
      .createQueryBuilder('movie')
      .where(`movie.id = '${id}'`)
      .leftJoinAndSelect('movie.liked_user', 'liked_user')
      .leftJoinAndSelect('movie.comments', 'comments', `comments.depth = 0 `)
      .leftJoinAndSelect('comments.user', 'user')
      .leftJoinAndSelect('comments.children', 'children')
      .leftJoinAndSelect('comments.liked_user', 'comment_liked_user')
      .leftJoinAndSelect('comment_liked_user.user', 'comment_liked_user_id')
      .leftJoinAndSelect('movie.actors', 'actors')
      .leftJoinAndSelect('actors.actor', 'actor')
      .getOne();

    result.genre = JSON.parse(result.genre);

    return result;
  }

  async searchMovie(word: string) {
    if (!word) {
      return [];
    }

    let result = await this.movieRepository.find({
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

    result = result.map((e) => {
      e.genre = JSON.parse(e.genre);
      return e;
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

  async addMyMovieList(id: number, req, type: string) {
    const isLink = await this.movieLikeLinkRepository.findOne({
      where: { movie: { id }, user: { id: req.user.id }, type: type },
    });

    if (isLink) {
      throw new BadRequestException('이미 목록에 있습니다');
    }

    const movie = await this.movieRepository.findOne({ where: { id: id } });

    if (!movie) {
      throw new NotFoundException('해당 영화를 찾을 수 없습니다.');
    }

    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
    });

    const link = new MovieLikeLink();
    switch (type) {
      case 'likeMovie':
        movie.like_count = movie.like_count + 1;
        await this.movieRepository.save(movie);
        link.user = user;
        link.movie = movie;
        link.type = 'likeMovie';
        await this.movieLikeLinkRepository.save(link);
        break;

      case 'dislikeMovie':
        movie.dislike_count = movie.dislike_count + 1;
        await this.movieRepository.save(movie);
        link.user = user;
        link.movie = movie;
        link.type = 'dislikeMovie';
        await this.movieLikeLinkRepository.save(link);
        break;

      case 'bestMovie':
        link.movie = movie;
        link.user = user;
        link.type = 'bestMovie';
        await this.movieLikeLinkRepository.save(link);
        break;

      case 'viewMovie':
        link.movie = movie;
        link.user = user;
        link.type = 'viewMovie';
        await this.movieLikeLinkRepository.save(link);
        break;
    }

    return movie;
  }

  async removeMyMovieList(id: number, req, type: string) {
    const movie = await this.movieRepository.findOne({
      where: { id: id },
    });

    if (!movie) {
      throw new NotFoundException('해당 영화를 찾을 수 없습니다.');
    }

    const link = await this.movieLikeLinkRepository.findOne({
      where: {
        type: type,
        movie: { id },
        user: { id: req.user.id },
      },
      relations: ['movie', 'user'],
    });

    if (!link) {
      throw new NotFoundException('해당 목록이 없습니다.');
    }

    switch (type) {
      case 'like':
        movie.like_count = movie.like_count - 1;
        break;

      case 'dislike':
        movie.dislike_count = movie.dislike_count - 1;
        break;
    }

    await this.movieRepository.save(movie);
    await this.movieLikeLinkRepository.delete(link.id);

    console.log(movie);
    return movie;
  }
}
