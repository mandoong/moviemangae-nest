import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { CommentRepository } from './comment.repository';
import { CommentCreateDto } from './dto/comment.create.dto';
import { MovieLikeLink } from 'src/movie_like_link/movie_like_link.entity';
import { MovieLikeLinkRepository } from 'src/movie_like_link/movie_like_link.repository';
import { resourceLimits } from 'worker_threads';
import { User } from 'src/user/user.entity';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: CommentRepository,

    @InjectRepository(MovieLikeLink)
    private movieLikeLinkRepository: MovieLikeLinkRepository,

    @InjectRepository(User)
    private userRepository: UserRepository,
  ) {}

  async getCommentsByMovieId(movie_id: number) {
    const result = await this.commentRepository.find({
      where: {
        movie_id: movie_id,
      },
    });

    return result;
  }

  async getMyComment(req) {
    const result: Comment[] = await this.commentRepository.find({
      where: { user: req.id },
      relations: {
        user: true,
      },
    });

    return result;
  }

  async createComments(commentCreateDto: CommentCreateDto, req) {
    const { movie_id, depth, content, parent_id } = commentCreateDto;
    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
    });

    const comment = new Comment();
    comment.movie_id = movie_id;
    comment.user = user;
    comment.depth = depth;
    comment.content = content;
    comment.parent_id = parent_id;

    await this.commentRepository.save(comment);

    return comment;
  }

  async updateComment(id: number, content: string) {
    const comment = await this.commentRepository.findOne({ where: { id: id } });

    if (comment) {
      comment.content = content;
      await this.commentRepository.save(comment);
    } else {
      throw new NotFoundException('해당 댓글을 찾을 수 없습니다.');
    }

    return comment;
  }

  async deleteComment(id: number) {
    await this.commentRepository.delete(id);
  }

  async likeComment(id: number, req) {
    const result: Comment = await this.commentRepository.findOne({
      where: { id: id },
    });

    if (!result) {
      throw new BadRequestException('해당 댓글을 찾을 수 없습니다.');
    }

    result.like = result.like + 1;

    const link = new MovieLikeLink();

    link.comment_id = id;
    link.user_id = req.user.id;

    await this.movieLikeLinkRepository.save(link);
  }

  async cancelLikeComment(id, req) {
    const result: Comment = await this.commentRepository.findOne({
      where: { id: id },
    });

    if (!result) {
      throw new BadRequestException('해당 댓글을 찾을 수 없습니다.');
    }

    result.like = result.like - 1;

    await this.commentRepository.save(result);

    const link = await this.movieLikeLinkRepository.findOne({
      where: { comment_id: id, user_id: req.user.id },
    });

    await this.movieLikeLinkRepository.delete(link.id);
  }
}
