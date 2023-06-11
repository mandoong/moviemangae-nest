import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { MovieRepository } from './movie.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './movie.entity';
import { MovieActorLinkRepository } from 'src/movie_actor_link/movie_actor_link.repository';
import { MovieActorLink } from 'src/movie_actor_link/movie_actor_link.entity';
import { MovieActorLinkModule } from 'src/movie_actor_link/movie_actor_link.module';
import { MovieLikeLinkModule } from 'src/movie_like_link/movie_like_link.module';
import { MovieLikeLink } from 'src/movie_like_link/movie_like_link.entity';
import { User } from 'src/user/user.entity';
import { UserRepository } from 'src/user/user.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: 60 * 60,
      },
    }),
    TypeOrmModule.forFeature([
      Movie,
      MovieRepository,
      MovieActorLink,
      MovieActorLinkRepository,
      MovieLikeLink,
      MovieActorLinkRepository,
      User,
      UserRepository,
    ]),
    MovieActorLinkModule,
    MovieLikeLinkModule,
  ],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
