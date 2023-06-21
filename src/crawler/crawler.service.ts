import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Crawler } from './crawler.entity';
import { Movie } from '../movie/movie.entity';
import { CrawlerRepository } from './crawler.repository';
import { MovieRepository } from '../movie/movie.repository';
import { parse as Parser } from 'node-html-parser';
import { Actor } from '../actor/actor.entity';
import { ActorRepository } from '../actor/actor.repository';
import { getConnection } from 'typeorm';
import { MovieActorLink } from '../movie_actor_link/movie_actor_link.entity';
import { MovieActorLinkRepository } from '../movie_actor_link/movie_actor_link.repository';
import dayjs = require('dayjs');
import { Top10 } from '../top10/top10.entity';
import { Top10Repository } from '../top10/top10.repository';
import { skip } from 'rxjs';

@Injectable()
export class CrawlerService {
  constructor(
    @InjectRepository(Crawler)
    private crawlerRepository: CrawlerRepository,

    @InjectRepository(Movie)
    private movieRepository: MovieRepository,

    @InjectRepository(Actor)
    private actorRepository: ActorRepository,

    @InjectRepository(MovieActorLink)
    private movieActorLinkRepository: MovieActorLinkRepository,

    @InjectRepository(Top10)
    private top10Repository: Top10Repository,
  ) {}

  getHeaders() {
    return {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
      },
    };
  }

  async getMovieData() {
    const url = 'https://apis.justwatch.com/graphql';

    let count = 0;
    let newCursor = '';
    const sortList = ['TRENDING', 'POPULAR', 'RANDOM'];

    while (true) {
      const payload = {
        operationName: 'GetPopularTitles',
        variables: {
          popularTitlesSortBy: 'TRENDING',
          first: 40,
          platform: 'WEB',
          sortRandomSeed: 1,
          popularAfterCursor: `${newCursor}`,
          popularTitlesFilter: {
            ageCertifications: [],
            excludeGenres: [],
            excludeProductionCountries: [],
            genres: [],
            objectTypes: ['MOVIE'],
            productionCountries: [],
            packages: ['nfx', 'dnp', 'wac', 'cou'],
            excludeIrrelevantTitles: false,
            presentationTypes: [],
            monetizationTypes: [],
            releaseYear: { min: 2010 },
          },
          watchNowFilter: {
            packages: ['nfx', 'dnp', 'wac', 'cou'],
            monetizationTypes: [],
          },
          language: 'ko',
          country: 'KR',
        },
        query:
          'query GetPopularTitles($country: Country!, $popularTitlesFilter: TitleFilter, $watchNowFilter: WatchNowOfferFilter!, $popularAfterCursor: String, $popularTitlesSortBy: PopularTitlesSorting! = POPULAR, $first: Int! = 1, $language: Language!, $platform: Platform! = WEB, $sortRandomSeed: Int! = 0, $profile: PosterProfile, $backdropProfile: BackdropProfile, $format: ImageFormat) {\n  popularTitles(\n    country: $country\n    filter: $popularTitlesFilter\n    after: $popularAfterCursor\n    sortBy: $popularTitlesSortBy\n    first: $first\n    sortRandomSeed: $sortRandomSeed\n  ) {\n    totalCount\n    pageInfo {\n      startCursor\n      endCursor\n      hasPreviousPage\n      hasNextPage\n      __typename\n    }\n    edges {\n      ...PopularTitleGraphql\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment PopularTitleGraphql on PopularTitlesEdge {\n  cursor\n  node {\n    id\n    objectId\n    objectType\n    content(country: $country, language: $language) {\n      title\n      fullPath\n      scoring {\n        imdbScore\n        __typename\n      }\n      posterUrl(profile: $profile, format: $format)\n      ... on ShowContent {\n        backdrops(profile: $backdropProfile, format: $format) {\n          backdropUrl\n          __typename\n        }\n        __typename\n      }\n      isReleased\n      __typename\n    }\n    likelistEntry {\n      createdAt\n      __typename\n    }\n    dislikelistEntry {\n      createdAt\n      __typename\n    }\n    watchlistEntry {\n      createdAt\n      __typename\n    }\n    watchNowOffer(country: $country, platform: $platform, filter: $watchNowFilter) {\n      id\n      standardWebURL\n      package {\n        id\n        packageId\n        clearName\n        __typename\n      }\n      retailPrice(language: $language)\n      retailPriceValue\n      lastChangeRetailPriceValue\n      currency\n      presentationType\n      monetizationType\n      availableTo\n      __typename\n    }\n    ... on Movie {\n      seenlistEntry {\n        createdAt\n        __typename\n      }\n      __typename\n    }\n    ... on Show {\n      seenState(country: $country) {\n        seenEpisodeCount\n        progress\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n',
      };

      const result = await axios.post(url, payload);

      if (result.status === 200 && count < 1960) {
        const edges = result.data.data.popularTitles.edges;
        const newEdges = [];

        while (edges.length > 0) {
          if (edges.length === 40) {
            newCursor = edges[39].cursor;
          }
          const edge = edges.pop();

          const content = JSON.stringify(edge);
          const movieId = edge.node.id;
          const newData = new Crawler();

          const value = await this.crawlerRepository.findOne({
            where: { movieId: movieId },
          });
          count++;

          if (!value) {
            newData.content = content;
            newData.movieId = movieId;
            newEdges.push(newData);
            console.log(count, 'New!', edge.node.content.title);
          } else {
            console.log(count);
          }
        }

        await this.crawlerRepository.save(newEdges);
      } else {
        console.log('End');
        break;
      }
    }
  }

  async getActor(actors, movie: Movie) {
    const actorData = actors
      .filter((data) => data.actor?.name && data.characterName)
      .map((data) => {
        const name = data.actor.name.replace(/&#x27;/g, "'");
        const characterName = data.characterName.replace(/&#x27;/g, "'");
        return { name, characterName };
      })
      .slice(0, 12);

    for (const data of actorData) {
      const isActor = await this.actorRepository.findOne({
        where: { name: data.name },
      });

      if (!isActor) {
        const actor = new Actor();
        actor.name = data.name;
        await this.actorRepository.save(actor);

        const link = new MovieActorLink();
        link.actor = actor;
        link.movie = movie;
        link.character = data.characterName;

        await this.movieActorLinkRepository.save(link);
      } else {
        const isLink = await this.movieActorLinkRepository.findOne({
          where: {
            movie: { id: isActor.id },
            character: data.character,
          },
          relations: ['movie'],
        });

        if (!isLink) {
          const link = new MovieActorLink();
          link.actor = isActor;
          link.movie = movie;
          link.character = data.characterName;

          await this.movieActorLinkRepository.save(link);
        }
      }
    }

    return 'good';
  }

  async refineCrawlerData() {
    function CreateJob(status: string, content: string) {
      return {
        status,
        content,
      };
    }
    const q = [];
    const fullData = [];
    let count = 0;

    // const result = await this.crawlerRepository.find();

    const result = await this.crawlerRepository
      .createQueryBuilder('crawler')
      .leftJoinAndSelect('movie', 'movie', 'crawler.movieId = movie.movieId')
      .where('movie.movieId IS NULL')
      .getMany();

    result.forEach((ele) => {
      const job = CreateJob('list', ele.content);
      q.push(job);
    });

    while (q.length > 0) {
      const job = q.shift();

      try {
        const Content = JSON.parse(job.content);
        const title = Content.node.content.title;
        const movieId = Content.node.id;
        const contentType = Content.node.objectType;
        const url = 'https://www.justwatch.com' + Content.node.content.fullPath;
        const scoring = Content.node.content.scoring.imdbScore;
        const platform = Content.node.watchNowOffer.package.clearName;
        const presentationType =
          Content.node.watchNowOffer.presentationType === '_4K'
            ? '4K'
            : Content.node.watchNowOffer.presentationType;
        const standardWebURL = Content.node.watchNowOffer.standardWebURL;
        const availableTo = Content.node.watchNowOffer.availableTo || '';

        const html = await axios.get(url, this.getHeaders());
        if (html.status === 200) {
          const root = Parser(html.data);
          const movieScript = root.querySelector(
            'script[type=application/ld+json]',
          );

          const parseData = JSON.parse(movieScript.innerText);
          const content = parseData['@graph'];
          const actor = content[0].actor;
          const dateCreated = content[0].dateCreated;
          const description = content[0].description;
          const duration = content[0].duration;
          const imageUrl = content[0].image || '';
          const director =
            content[0].director.length >= 1 ? content[0].director[0].name : '';
          const genre = JSON.stringify(content[0].genre);
          const img = root.querySelector('.title-poster__image > img ');
          const main_imageUrl = img ? img.getAttribute('data-src') : null;

          const cover = root.querySelector(
            '.youtube-player__image-preview-container> picture > img ',
          );
          const cover2 = root.querySelector('.swiper-slide > picture > img ');
          const cover_img = cover
            ? cover.getAttribute('src')
            : cover2
            ? cover2.getAttribute('src')
            : null;

          const isMovie = await this.movieRepository.findOne({
            where: { movieId: movieId },
          });
          count++;
          const time = `${new Date().getHours()}.${new Date().getMinutes()}.${new Date().getSeconds()}`;

          if (!isMovie) {
            const saveData = new Movie();

            saveData.movieId = movieId;
            saveData.title = title;
            saveData.contentType = contentType;
            saveData.url = url;
            saveData.platform = platform;
            saveData.presentationType = presentationType;
            saveData.standardWebURL = standardWebURL;
            saveData.imageUrl = imageUrl;
            saveData.main_imageUrl = main_imageUrl;
            saveData.cover_imageUrl = cover_img;
            saveData.availableTo = new Date(availableTo) || null;
            saveData.scoring = scoring;
            saveData.dateCreated = dateCreated;
            saveData.description = description;
            saveData.duration = duration;
            saveData.director = director;
            saveData.genre = genre;
            saveData.updated_at = new Date();

            console.log('New', q.length, time, title);

            await this.movieRepository.save(saveData);
            this.getActor(actor, saveData);
          } else {
            isMovie.contentType = contentType;
            isMovie.url = url;
            isMovie.scoring = scoring;
            isMovie.platform = platform;
            isMovie.presentationType = presentationType;
            isMovie.standardWebURL = standardWebURL;
            isMovie.imageUrl = imageUrl;
            isMovie.main_imageUrl = main_imageUrl;
            isMovie.cover_imageUrl = cover_img;
            isMovie.availableTo = new Date(availableTo) || null;
            isMovie.dateCreated = dateCreated;
            isMovie.description = description;
            isMovie.duration = duration;
            isMovie.director = director;
            isMovie.genre = genre;
            isMovie.updated_at = new Date();

            console.log('Update', q.length, time, title);

            await this.movieRepository.save(isMovie);
            this.getActor(actor, isMovie);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }

    console.log('END');
    return fullData;
  }

  async getTop10Movies() {
    const date = dayjs().add(-1, 'day').format('YYYY-MM-DD');
    const html = await axios.get(
      `https://flixpatrol.com/top10/netflix/south-korea/${date}/`,
      this.getHeaders(),
    );
    if (html.status === 200) {
      const root = Parser(html.data);
      const element = root.querySelector(
        "div:has( > h3:contains('TOP 10 Movies'))",
      );
      const movies = element.querySelectorAll('a');

      const result = [];

      while (movies.length > 0) {
        const q = movies.shift();

        const movieName = q.textContent;

        const movie = await axios.post('https://apis.justwatch.com/graphql', {
          operationName: 'GetSuggestedTitles',
          variables: {
            country: 'KR',
            language: 'ko',
            first: 1,
            filter: { searchQuery: `${movieName}` },
          },
          query:
            'query GetSuggestedTitles($country: Country!, $language: Language!, $first: Int!, $filter: TitleFilter) {\n  popularTitles(country: $country, first: $first, filter: $filter) {\n    edges {\n      node {\n        ...SuggestedTitle\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment SuggestedTitle on MovieOrShow {\n  id\n  objectType\n  objectId\n  content(country: $country, language: $language) {\n    fullPath\n    title\n    originalReleaseYear\n    posterUrl\n    fullPath\n    __typename\n  }\n  __typename\n}\n',
        });

        const movieId = movie.data.data.popularTitles.edges[0].node.id;
        console.log(movieId);

        result.push(movieId);
      }

      const has = await this.top10Repository.findOne({ where: { date: date } });

      if (!has) {
        const top10 = new Top10();
        top10.date = date;
        top10.movie_id = JSON.stringify(result);

        await this.top10Repository.save(top10);
      }

      return result;
    }
  }
}
