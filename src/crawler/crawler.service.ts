import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Crawler } from './crawler.entity';
import { Movie } from 'src/movie/movie.entity';
import { CrawlerRepository } from './crawler.repository';
import { MovieRepository } from 'src/movie/movie.repository';
import { parse as Parser } from 'node-html-parser';
import JSON5 from 'jSON5';
import { Actor } from 'src/actor/actor.entity';
import { ActorRepository } from 'src/actor/actor.repository';
import { getConnection } from 'typeorm';
import { MovieActorLink } from 'src/movie_actor_link/movie_actor_link.entity';
import { MovieActorLinkRepository } from 'src/movie_actor_link/movie_actor_link.repository';
import * as dayjs from 'dayjs';

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

    while (true) {
      const payload = {
        operationName: 'GetPopularTitles',
        variables: {
          popularTitlesSortBy: 'POPULAR',
          first: 40,
          platform: 'WEB',
          sortRandomSeed: 0,
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
            releaseYear: { min: 1999 },
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

      if (result.status === 200) {
        const edges = result.data.data.popularTitles.edges;
        const newEdges = [];

        edges.forEach(async (edge) => {
          console.log(edge.node.content.title, new Date(), count, newCursor);
          const content = JSON.stringify(edge);
          const movieId = edge.node.id;
          const newData = new Crawler();

          const value = await this.crawlerRepository.findOne({
            where: { movieId: movieId },
          });
          if (value) {
            newData.content = content;
            newData.movieId = movieId;
            newEdges.push(newData);
          }

          count++;
        });

        await this.crawlerRepository.save(newEdges);

        const lastEdge = edges.pop();
        newCursor = lastEdge.cursor;
      } else {
        break;
      }
    }
  }

  async getActor() {
    const actorList = await this.movieRepository
      .createQueryBuilder('movie')
      .select(['movie.id', 'movie.actor'])
      .getMany();

    let count = 0;

    while (actorList.length > 0) {
      const actors = actorList.pop();

      const parseActor = JSON.parse(actors.actor);

      const actorData = parseActor.slice(0, 8).map((data) => {
        const movie_id = actors.id;
        const name = data.actor?.name || false;
        const characterName = data.characterName || false;

        if (movie_id && name && characterName) {
          return { movie_id, name, characterName };
        }
      });

      while (actorData.length > 0) {
        const v = actorData.pop();

        if (v) {
          const actor = new Actor();
          actor.name = v.name;

          const isActor = await this.actorRepository.find({
            where: { name: v.name },
          });

          if (!isActor.length) {
            await this.actorRepository.save(actor);
          }

          const actorId = await this.actorRepository.findOne({
            where: { name: v.name },
          });

          const isLink = await this.movieActorLinkRepository.find({
            where: {
              movie_id: v.movie_id,
              actor_id: actorId.id,
              character: v.characterName,
            },
          });

          const link = new MovieActorLink();
          link.actor_id = actorId.id;
          link.movie_id = v.movie_id;
          link.character = v.characterName;

          if (!isLink.length) {
            await this.movieActorLinkRepository.save(link);
          }

          count++;

          console.log([actorList.length, count]);
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

    const result = await this.crawlerRepository.find();

    result.forEach((ele) => {
      const job = CreateJob('list', ele.content);
      q.push(job);
    });

    while (q.length > 0) {
      const job = q.pop();

      try {
        const Content = JSON.parse(job.content);
        const title = Content.node.content.title;
        const movieId = Content.node.id;
        const contentType = Content.node.objectType;
        const url = 'https://www.justwatch.com' + Content.node.content.fullPath;
        const scoring = JSON.stringify(Content.node.content.scoring);
        const platform = Content.node.watchNowOffer.package.clearName;
        const presentationType = Content.node.watchNowOffer.presentationType;
        const standardWebURL = Content.node.watchNowOffer.standardWebURL;
        const availableTo = Content.node.watchNowOffer.availableTo || '';
        console.log(title, q.length);

        const html = await axios.get(url, this.getHeaders());
        if (html.status === 200) {
          const root = Parser(html.data);
          const movieScript = root.querySelector(
            'script[type=application/ld+json]',
          );

          const parseData = JSON.parse(movieScript.innerText);
          const content = parseData['@graph'];
          const actor = JSON.stringify(content[0].actor);
          const dateCreated = content[0].dateCreated;
          const description = content[0].description;
          const duration = content[0].duration;
          const imageUrl = content[0].image || '';
          const director = JSON.stringify(content[0].director[0]) || '';
          const genre = JSON.stringify(content[0].genre);

          const isMovie = await this.movieRepository.findOne({
            where: { movieId: movieId },
          });

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
            saveData.availableTo = availableTo;
            saveData.scoring = scoring;
            saveData.actor = actor;
            saveData.dateCreated = dateCreated;
            saveData.description = description;
            saveData.duration = duration;
            saveData.director = director;
            saveData.genre = genre;

            await this.movieRepository.save(saveData);
          } else {
            isMovie.contentType = contentType;
            isMovie.url = url;
            isMovie.scoring = scoring;
            isMovie.platform = platform;
            isMovie.presentationType = presentationType;
            isMovie.standardWebURL = standardWebURL;
            isMovie.imageUrl = imageUrl;
            isMovie.availableTo = availableTo;
            isMovie.actor = actor;
            isMovie.dateCreated = dateCreated;
            isMovie.description = description;
            isMovie.duration = duration;
            isMovie.director = director;
            isMovie.genre = genre;

            await this.movieRepository.save(isMovie);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
    this.getActor();

    return fullData;
  }

  async refineCrawlerDataById(id: string) {
    function CreateJob(status: string, content: string) {
      return {
        status,
        content,
      };
    }
    const q = [];
    const fullData = [];

    const result = await this.crawlerRepository.find({
      where: {
        movieId: id,
      },
    });

    result.forEach((ele) => {
      const job = CreateJob('list', ele.content);
      q.push(job);
    });

    while (q.length > 0) {
      const job = q.pop();

      try {
        const Content = JSON.parse(job.content);
        const title = Content.node.content.title;
        const movieId = Content.node.id;
        const contentType = Content.node.objectType;
        const url = 'https://www.justwatch.com' + Content.node.content.fullPath;
        const scoring = JSON.stringify(Content.node.content.scoring);
        const platform = Content.node.watchNowOffer.package.clearName;
        const presentationType = Content.node.watchNowOffer.presentationType;
        const standardWebURL = Content.node.watchNowOffer.standardWebURL;
        const availableTo = Content.node.watchNowOffer.availableTo || '';
        console.log(title, q.length);

        const html = await axios.get(url, this.getHeaders());
        if (html.status === 200) {
          const root = Parser(html.data);
          const movieScript = root.querySelector(
            'script[type=application/ld+json]',
          );

          const parseData = JSON.parse(movieScript.textContent);
          const content = parseData['@graph'];
          const actor = JSON.stringify(content[0].actor);
          const dateCreated = content[0].dateCreated;
          const description = content[0].description;
          const duration = content[0].duration;
          const imageUrl = content[0].image;
          const director = JSON.stringify(content[0].director[0]);
          const genre = JSON.stringify(content[0].genre);

          await this.movieRepository.save({
            movieId,
            title,
            contentType,
            url,
            scoring,
            platform,
            presentationType,
            standardWebURL,
            imageUrl,
            availableTo,
            actor,
            dateCreated,
            description,
            duration,
            director,
            genre,
          });
        }
      } catch {
        console.log('err');
      }
    }

    return fullData;
  }

  async getTop10Movies() {
    const date = dayjs().add(-1, 'day').format('YYYY-MM-DD');
    console.log(date);
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

        const movieData = await this.movieRepository.find({
          where: {
            movieId: movieId,
          },
        });

        result.push(movieData);
      }

      return result;
    }
  }
}