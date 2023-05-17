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
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentCreateDto } from './dto/comment.create.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get('/find/:id')
  getComments(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.getCommentsByMovieId(id);
  }

  @Post()
  createComment(@Body(ValidationPipe) commentCreateDto: CommentCreateDto) {
    return this.commentService.createComments(commentCreateDto);
  }

  @Get('/my')
  @UseGuards(AuthGuard())
  getMyComment(@Req() req) {
    return this.commentService.getMyComment(req);
  }

  @Delete('/:id')
  deleteComment(@Param('id') id: number) {
    return this.commentService.deleteComment(id);
  }

  @Get('/like/:id')
  @UseGuards(AuthGuard())
  likeComment(@Param('id') id: number, @Req() req) {
    return this.commentService.likeComment(id, req);
  }

  @Delete('/like/:id')
  @UseGuards(AuthGuard())
  cancelLikeComment(@Param('id') id: number, @Req() req) {
    return this.commentService.cancelLikeComment(id, req);
  }
}
