import { Module } from '@nestjs/common';
import { MovieModule } from './movie/movie.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './configs/typeorm.config';
import { CrawlerModule } from './crawler/crawler.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CommentModule } from './comment/comment.module';
import { ActorModule } from './actor/actor.module';
import { MovieActorLinkModule } from './movie_actor_link/movie_actor_link.module';
import { MovieLikeLinkModule } from './movie_like_link/movie_like_link.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MovieModule,
    CrawlerModule,
    CommentModule,
    AuthModule,
    UserModule,
    ActorModule,
    MovieActorLinkModule,
    MovieLikeLinkModule,
  ],
})
export class AppModule {}
