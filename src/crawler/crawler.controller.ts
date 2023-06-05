import { Controller, Get, Param } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(private crawlerService: CrawlerService) {}

  @Get('/')
  getCrawlerData() {
    return this.crawlerService.getMovieData();
  }

  @Get('/refine')
  refineCrawlerData() {
    return this.crawlerService.refineCrawlerData();
  }

  @Get('/top10/')
  getTop10Movies() {
    return this.crawlerService.getTop10Movies();
  }
}
