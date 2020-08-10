import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity()
export class GRepository{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    owner: string
}