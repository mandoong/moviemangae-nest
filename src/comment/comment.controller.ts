import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentCreateDto } from './dto/comment.create.dto';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get('/:id')
  getComments(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.getCommentsByMovieId(id);
  }

  @Post()
  createComment(@Body(ValidationPipe) commentCreateDto: CommentCreateDto) {
    return this.commentService.createComments(commentCreateDto);
  }
}
