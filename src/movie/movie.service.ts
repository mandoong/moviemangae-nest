import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './movie.entity';
import { Repository } from 'typeorm';
const axios = require('axios');
const { parse } = require('node-html-parser');

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  async getMovie() {
    const result = await this.movieRepository.find();

    return result;
  }

  async getMovieByPlatform(platform: string) {
    const result = await this.movieRepository.find({
      where: { platform: platform },
    });

    return [result.length, result];
  }
}
