import { Controller, Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { CommentRepository } from './comment.repository';
import { MovieLikeLink } from '../movie_like_link/movie_like_link.entity';
import { MovieLikeLinkRepository } from '../movie_like_link/movie_like_link.repository';
import { PassportModule } from '@nestjs/passport';
import { UserRepository } from '../user/user.repository';
import { User } from '../user/user.entity';
import { Movie } from '../movie/movie.entity';
import { MovieRepository } from '../movie/movie.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Comment,
      CommentRepository,
      MovieLikeLink,
      MovieLikeLinkRepository,
      User,
      UserRepository,
      Movie,
      MovieRepository,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule { }
