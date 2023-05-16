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

  @Get('/update')
  updateCrawlerData() {
    return this.crawlerService.updateCrawlerData();
  }

  @Get('/refine/:id')
  refineCrawlerDataById(@Param('id') id: string) {
    return this.crawlerService.refineCrawlerDataById(id);
  }

  @Get('/top10/:id')
  getTop10Movies(@Param('id') id: string) {
    return this.crawlerService.getTop10Movies(id);
  }

  @Get('/actor')
  getActors() {
    return this.crawlerService.getActor();
  }
}
