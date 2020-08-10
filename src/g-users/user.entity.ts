import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    name: string;
}