import {Entity, PrimaryColumn, Column} from 'typeorm';

@Entity()
export class GRepository{
    @PrimaryColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    owner: string
}