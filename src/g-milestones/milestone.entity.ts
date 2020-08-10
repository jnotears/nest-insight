import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class GMilestone {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    number: number;

    @Column()
    title: string;

    @Column()
    creator: string;

    @Column()
    dueOn: Date;

    @Column()
    createdAt: Date;

    @Column({ nullable: true })
    closedAt: Date;

    @Column()
    state: string;

    @Column()
    repositoryId: number;
}