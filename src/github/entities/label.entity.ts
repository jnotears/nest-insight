import { GitLabelAPIResponse } from './../dtos/github.api.dto';
import { EntityBase } from 'src/shared/base/entity.base';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LabelEntity extends EntityBase{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    color: string;

    @Column()
    repo_id: number;

    @Column()
    url: string;

    static from(data: GitLabelAPIResponse): LabelEntity{
       return {
            ...new LabelEntity(),
            name: data.name,
            color: data.color,
            description: data.description,
            url: data.url
       }
    }
}
