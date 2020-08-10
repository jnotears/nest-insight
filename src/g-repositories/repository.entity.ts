import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity()
export class Repository{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    owner: string
}