import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GLabel{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    color: string;

    @Column()
    repositoryId: number;
}