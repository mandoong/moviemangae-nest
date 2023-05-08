import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Crawler } from './crawler.entity';
import { Movie } from 'src/movie/movie.entity';
import { CrawlerRepository } from './crawler.repository';
import { MovieRepository } from 'src/movie/movie.repository';
import { parse as Parser } from 'node-html-parser';
import JSON5 from 'jSON5';

@Injectable()
export class CrawlerService {
  constructor(
    @InjectRepository(Crawler)
    private crawlerRepository: CrawlerRepository,

    @InjectRepository(Movie)
    private movieRepository: MovieRepository,
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

        edges.forEach((edge) => {
          console.log(edge.node.content.title, new Date(), count, newCursor);
          const content = JSON.stringify(edge);
          const movieId = edge.node.id;
          newEdges.push({ content, movieId });
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

  async refineCrawlerData() {
    function CreateJob(status: string, content: string) {
      return {
        status,
        content,
      };
    }
    const q = [];
    const fullData = [];

    const result = await this.crawlerRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie', 'crawler', 'movie.movieId = crawler.movieId')
      .where('crawler.movieId IS NULL')
      .getMany();

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
      } catch (err) {
        console.log(err);
      }
    }

    return fullData;
  }

  async updateCrawlerData() {
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

          await this.movieRepository.update(
            { movieId },
            {
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
            },
          );
        }
      } catch (err) {
        console.log(err);
      }
    }

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

  async getTop10Movies(date: string) {
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
