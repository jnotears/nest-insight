import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class GAction{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column()
    content: string;

    @Column()
    actor: string;

    @Column()
    createdAt: Date;

    @Column()
    url: string;

    @Column()
    issueId: number;
}