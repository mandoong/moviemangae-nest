import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common/decorators';
import { Top10Service } from './top10.service';

@Controller('top10')
export class Top10Controller {
  constructor(private top10service: Top10Service) {}

  @Get('/today')
  getTop10Today() {
    return this.top10service.getTop10Today();
  }
}