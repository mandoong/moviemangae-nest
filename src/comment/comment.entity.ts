import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  movie_id: number;

  @Column()
  user_id: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  content: string;

  @Column({
    default: 0,
  })
  like: number;

  @Column({
    default: 0,
  })
  report: number;

  @Column({
    default: 0,
  })
  parent_id: number;

  @Column({
    default: 0,
  })
  depth: number;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
