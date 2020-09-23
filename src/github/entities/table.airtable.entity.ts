import { EntityBase } from './../../shared/base/entity.base';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TableAirtable extends EntityBase{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    issue_id: string;

    @Column()
    external_id: string;

    @Column()
    number: string;

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
    repo_id: string;

    @Column()
    closed_at: string;

    @Column()
    estimate: string;

    @Column()
    assignee: string;

    @Column()
    config_id: number;

}
