import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: UserRepository,
  ) {}

  async getAllUser(page: number) {
    const result = await this.userRepository.find({ take: 30, skip: page });

    return result;
  }
  async getUser(id: number) {
    const result = await this.userRepository.findOne({ where: { id: id } });

    if (!result) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    }

    return result;
  }

  async getMyLikeMovie(req) {
    const user = this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id: req.user.id })
      .leftJoinAndSelect(
        'user.liked_movie',
        'liked_movie',
        'liked_movie.type = "likeMovie"',
      )
      .leftJoinAndSelect('liked_movie.movie', 'likeMovie')
      .leftJoinAndSelect(
        'user.disliked_movie',
        'disliked_movie',
        'disliked_movie.type = "dislikeMovie"',
      )
      .leftJoinAndSelect('disliked_movie.movie', 'dislikeMovie')
      .getOne();

    return user;
  }

  async getMyProfile(req) {
    const { email } = req.user;

    const profile = await this.userRepository
      .createQueryBuilder('user')
      .where(`user.email = :email`, { email: email })
      .select(['user.id', 'user.email', 'user.name'])
      .leftJoinAndSelect(
        'user.liked_movie',
        'liked_movie',
        'liked_movie.type = "likeMovie"',
      )
      .leftJoinAndSelect('liked_movie.movie', 'likeMovie')
      .leftJoinAndSelect(
        'user.disliked_movie',
        'disliked_movie',
        'disliked_movie.type = "dislikeMovie"',
      )
      .leftJoinAndSelect('disliked_movie.movie', 'dislikeMovie')
      .leftJoinAndSelect(
        'user.liked_comments',
        'liked_comments',
        'liked_comments.type = "comment"',
      )
      .leftJoinAndSelect('liked_comments.comment', 'comment')
      .leftJoinAndSelect('comment.user', 'comment_user')
      .leftJoinAndSelect('user.comments', 'comments')
      .leftJoinAndSelect(
        'user.best_movies',
        'best_movies',
        'best_movies.type = "bestMovie"',
      )
      .leftJoinAndSelect('best_movies.movie', 'best_movie')
      .leftJoinAndSelect(
        'user.view_movies',
        'view_movies',
        'view_movies.type = "viewMovie"',
      )
      .leftJoinAndSelect('view_movies.movie', 'view_movie')
      .getOne();

    return profile;
  }
}
