import { EntityBase } from 'src/shared/base/entity.base';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProjectEntity extends EntityBase{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    external_id: number;

    @Column()
    number: number;

    @Column()
    name: string;
    
    @Column()
    content: string;

    @Column()
    state: string;

    @Column()
    repo_id: number;
}