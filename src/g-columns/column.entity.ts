import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class GColumn {
    @PrimaryColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    projectId: number;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;
}