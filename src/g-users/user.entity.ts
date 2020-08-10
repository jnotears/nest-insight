import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class GUser {
    @PrimaryColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    name: string;
}