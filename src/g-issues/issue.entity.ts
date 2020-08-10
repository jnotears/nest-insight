import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Issue{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    issueNumber: number;

    @Column()
    author: string;

    @Column()
    content: string;

    @Column()
    estimate: number;

    @Column()
    repositoryId: number;
}