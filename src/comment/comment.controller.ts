import {
  Body,
  Controller,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  Post,
  ValidationPipe,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentCreateDto } from './dto/comment.create.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get('/all')
  getAllComment(@Query('page') page: number) {
    return this.commentService.getAllComment(page);
  }

  @Get('/count')
  getCommentCount() {
    return this.commentService.getCommentCount();
  }

  @Get('/movie/:id')
  getComments(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.getCommentsByMovieId(id);
  }

  @Get('/best')
  getBestComments() {
    return this.commentService.getBestComment();
  }

  @Get('/id/:id')
  getCommentById(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.getCommentById(id);
  }

  @Delete('/:id')
  deleteComment(@Param('id') id: number) {
    return this.commentService.deleteComment(id);
  }

  @Post('/')
  @UseGuards(AuthGuard())
  createComment(
    @Body(ValidationPipe) commentCreateDto: CommentCreateDto,
    @Req() req: Request,
  ) {
    return this.commentService.createComments(commentCreateDto, req);
  }

  @Get('/my')
  @UseGuards(AuthGuard())
  getMyComment(@Req() req) {
    return this.commentService.getMyComment(req);
  }

  @Post('/:id/like')
  @UseGuards(AuthGuard())
  likeComment(@Param('id') id: number, @Req() req) {
    return this.commentService.likeComment(id, req);
  }

  @Delete('/:id/like')
  @UseGuards(AuthGuard())
  cancelLikeComment(@Param('id') id: number, @Req() req) {
    return this.commentService.cancelLikeComment(id, req);
  }
}
