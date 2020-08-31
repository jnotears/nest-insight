import { EntityBase } from 'src/shared/base/entity.base';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class MilestoneEntity extends EntityBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    number: number;

    @Column()
    node_id: string;

    @Column()
    description: string;

    @Column()
    name: string;

    @Column()
    url: string;

    @Column()
    creator: string;

    @Column({ nullable: true })
    due_on: Date;

    @Column({ nullable: true })
    closed_at: Date;

    @Column()
    state: string;

    @Column()
    repo_id: number;
}