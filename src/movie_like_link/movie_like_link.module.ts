import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieLikeLink } from './movie_like_link.entity';
import { MovieLikeLinkRepository } from './movie_like_link.repository';
import { MovieLikeLinkController } from './movie_like_link.controller';
import { MovieLikeLinkService } from './movie_like_link.service';
import { User } from 'src/user/user.entity';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovieLikeLink,
      MovieLikeLinkRepository,
      User,
      UserRepository,
    ]),
  ],
  controllers: [MovieLikeLinkController],
  providers: [MovieLikeLinkService],
  exports: [MovieLikeLinkService],
})
export class MovieLikeLinkModule {}
