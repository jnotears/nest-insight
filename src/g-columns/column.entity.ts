import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GColumn {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    projectId: number;

    @Column()
    createAt: Date;

    @Column()
    updateAt: Date;
}