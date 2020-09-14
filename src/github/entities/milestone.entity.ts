import { EntityBase } from 'src/shared/base/entity.base';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { GitMilestoneAPIResponse } from '../dtos/github.api.dto';

@Entity()
export class MilestoneEntity extends EntityBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    number: number;

    @Column({nullable: true})
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

    static from(data: GitMilestoneAPIResponse): MilestoneEntity{
        return {
            ...new MilestoneEntity(),
            name: data.name,
            number: data.number,
            creator: data.creator,
            url: data.url,
            state: data.state,
            due_on: data.due_on,
            description: data.description,
            closed_at: data.closed_at ? data.closed_at : null
        }
      }
}
