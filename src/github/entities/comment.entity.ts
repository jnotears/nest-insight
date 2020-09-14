import { GitCommentAPIResponse } from './../dtos/github.api.dto';
import { EntityBase } from './../../shared/base/entity.base';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CommentEntity extends EntityBase{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    external_id: number;

    @Column()
    issue_id: number;

    @Column()
    author: string;

    @Column()
    content: string;

    @Column()
    url: string;

    static from(data: GitCommentAPIResponse): CommentEntity{
      return {
        ...new CommentEntity(),
        external_id: data.external_id,
        content: data.content,
        author: data.author,
        url: data.url
      }
    }
}
