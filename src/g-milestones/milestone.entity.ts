import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity()
export class Milestone{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    number: number;

    @Column()
    title: string;

    @Column()
    dueOn: number;
}