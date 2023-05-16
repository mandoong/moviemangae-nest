import { Repository } from 'typeorm';
import { Comment } from './comment.entity';

export class CommentRepository extends Repository<Comment> {}
