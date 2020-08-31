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

    @Column({nullable: true})
    mile_id: number;

    @Column()
    repo_id: number;

    static from(data: GitIssueAPIResponse): IssueEntity{
      return {
        ...new IssueEntity(),
        external_id: data.external_id,
        name: data.name,
        content: data.content,
        number: data.number,
        repo_id: data.repo_id,
        author: data.author,
        url: data.url,
        state: data.state,
      }
    }
}