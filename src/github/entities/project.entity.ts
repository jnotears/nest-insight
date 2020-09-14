import { EntityBase } from 'src/shared/base/entity.base';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { GitProjectAPIResponse } from '../dtos/github.api.dto';

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
    
    @Column({nullable: true})
    description: string;

    @Column()
    state: string;

    @Column()
    repo_id: number;

    @Column({nullable: true})
    closed_at: Date;

    static from(data: GitProjectAPIResponse){
        return {
            ...new ProjectEntity(),
            external_id: data.external_id,
            number: data.number,
            name: data.name,
            description: data.description,
            state: data.state,
            closed_at: data.closed_at ? data.closed_at : null
        }
    }
}
