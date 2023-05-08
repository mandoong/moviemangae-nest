import { Module } from '@nestjs/common';
import { MovieModule } from './movie/movie.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './configs/typeorm.config';
import { CrawlerModule } from './crawler/crawler.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MovieModule,
    CrawlerModule,
  ],
})
export class AppModule {}
