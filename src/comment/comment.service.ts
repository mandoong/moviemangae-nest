import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { CommentRepository } from './comment.repository';
import { CommentCreateDto } from './dto/comment.create.dto';
import { MovieLikeLink } from '../movie_like_link/movie_like_link.entity';
import { MovieLikeLinkRepository } from '../movie_like_link/movie_like_link.repository';
import { resourceLimits } from 'worker_threads';
import { User } from '../user/user.entity';
import { UserRepository } from '../user/user.repository';
import { Movie } from '../movie/movie.entity';
import { MovieRepository } from '../movie/movie.repository';
import { Request } from 'express';
import { LessThan, MoreThan } from 'typeorm';
import { relative } from 'path';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: CommentRepository,

    @InjectRepository(MovieLikeLink)
    private movieLikeLinkRepository: MovieLikeLinkRepository,

    @InjectRepository(Movie)
    private movieRepository: MovieRepository,

    @InjectRepository(User)
    private userRepository: UserRepository,
  ) {}

  async getCommentsByMovieId(movie_id: number) {
    const result = await this.commentRepository.find({
      where: {
        movie_id: movie_id,
      },
      relations: { children: true, user: true },
    });

    return result;
  }

  async getCommentCount() {
    const result = await this.commentRepository.count();

    return result;
  }

  async getCommentById(id: number) {
    const result = await this.commentRepository.findOne({
      where: { id: id },
      relations: [
        'children',
        'children.user',
        'liked_user',
        'user',
        'comment_movie',
      ],
    });

    return result;
  }

  async getAllComment(page = 0) {
    const result: Comment[] = await this.commentRepository.find({
      skip: page * 30,
      take: 30,
      relations: {
        children: true,
        user: true,
        comment_movie: true,
        parent: true,
      },
      order: { created_at: 'DESC' },
    });

    return result;
  }

  async getMyComment(req) {
    const result: Comment[] = await this.commentRepository.find({
      where: { user: { id: req.user.id } },
      relations: {
        user: true,
        children: true,
        comment_movie: true,
        parent: true,
      },
    });

    return result;
  }

  async getBestComment() {
    const today = new Date();
    const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1));

    const result: Comment[] = await this.commentRepository.find({
      where: { created_at: MoreThan(oneMonthAgo) },
      relations: {
        user: true,
        children: true,
        comment_movie: true,
        parent: true,
      },
      order: { like: 'DESC' },
      take: 10,
    });

    return result;
  }

  async createComments(commentCreateDto: CommentCreateDto, req) {
    const { movie_id, depth, content, parent_id } = commentCreateDto;
    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
    });

    const movie = await this.movieRepository.findOne({
      where: { id: movie_id },
      relations: ['comments', 'comments.user'],
    });

    if (depth === 0 && movie.comments.some((e) => e.user.id === req.user.id)) {
      throw new BadRequestException('이미 작성된 리뷰가 있습니다.');
    }

    const comment = new Comment();
    comment.movie_id = movie_id;
    comment.user = user;
    comment.depth = depth;
    comment.content = content;

    if (depth > 0) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: parent_id },
        relations: { children: true },
      });
      comment.parent = parentComment;
      await this.commentRepository.save(parentComment);
    }

    movie.comments.push(comment);

    await this.commentRepository.save(comment);
    await this.movieRepository.save(movie);
    return comment;
  }

  async updateComment(id: number, content: string, req) {
    const comment = await this.commentRepository.findOne({
      where: { id: id },
      relations: { user: true },
    });

    if (req.user.id !== comment.user.id) {
      throw new BadRequestException('해당 리뷰의 작성자가 아닙니다.');
    }
    if (comment) {
      comment.content = content;
      await this.commentRepository.save(comment);
    } else {
      throw new NotFoundException('해당 댓글을 찾을 수 없습니다.');
    }

    return comment;
  }

  async deleteComment(id: number) {
    const links = await this.movieLikeLinkRepository.find({
      where: { comment: { id: id } },
      relations: { comment: true },
    });

    const children = await this.commentRepository.find({
      where: { parent: { id: id } },
      relations: { parent: true },
    });

    await this.movieLikeLinkRepository.remove(links);
    await this.commentRepository.remove(children);
    await this.commentRepository.delete(id);
  }

  async likeComment(id: number, req) {
    const comment = await this.commentRepository.findOne({
      where: {
        id: id,
      },
      relations: ['liked_user', 'liked_user.user'],
    });

    if (!comment) {
      throw new NotFoundException('해당 댓글을 찾을 수 없습니다.');
    } else if (comment.liked_user.some((e) => e.user.id === req.user.id)) {
      throw new BadRequestException('이미 좋아요를 하였습니다.');
    }

    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
    });

    const link = new MovieLikeLink();
    link.comment = comment;
    link.user = user;
    link.type = 'comment';

    comment.like = comment.like + 1;

    await this.commentRepository.save(comment);
    await this.movieLikeLinkRepository.save(link);

    return comment;
  }

  async cancelLikeComment(id: number, req) {
    const comment: Comment = await this.commentRepository.findOne({
      where: { id: id },
    });

    if (!comment) {
      throw new NotFoundException('해당 댓글을 찾을 수 없습니다.');
    }

    const link = await this.movieLikeLinkRepository.findOne({
      where: {
        type: 'comment',
        comment: { id },
        user: { id: req.user.id },
      },
      relations: ['comment', 'user'],
    });

    if (!link) {
      throw new NotFoundException('해당 댓글에 좋아요 하지 않았습니다.');
    }

    comment.like = comment.like - 1;
    await this.commentRepository.save(comment);
    await this.movieLikeLinkRepository.delete(link.id);
    return comment;
  }
}
