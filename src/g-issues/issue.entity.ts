import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
export class GIssue{
    @PrimaryColumn()
    id: number;

    @Column()
    issueNumber: number;

    @Column()
    author: string;

    @Column()
    content: string;

    @Column()
    url: string;

    @Column({nullable: true})
    estimate: Date;

    @Column()
    repositoryId: number;
}