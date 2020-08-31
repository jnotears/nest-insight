import { EntityBase } from './../../shared/base/entity.base';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LabelEntity extends EntityBase{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    node_id: string;

    @Column()
    url: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    color: string;

    @Column()
    repo_id: number;
}