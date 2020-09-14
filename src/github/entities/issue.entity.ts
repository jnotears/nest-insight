import { EntityBase } from './../../shared/base/entity.base';
import { GitIssueAPIResponse } from './../dtos/github.api.dto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class IssueEntity extends EntityBase{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    external_id: number;

    @Column()
    number: number;

    @Column()
    name: string;

    @Column()
    state: string;

    @Column()
    author: string;

    @Column()
    content: string;

    @Column()
    url: string;

    @Column()
    repo_id: number;

    @Column({nullable: true})
    closed_at: Date;

    static from(data: GitIssueAPIResponse): IssueEntity{
      return {
        ...new IssueEntity(),
        external_id: data.external_id,
        name: data.name,
        content: data.content,
        number: data.number,
        author: data.author,
        url: data.url,
        state: data.state,
        closed_at: data.closed_at ? data.closed_at : null
      }
    }
}
