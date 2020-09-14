import { EntityBase } from 'src/shared/base/entity.base';
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';
import { GitColumnAPIResponse } from '../dtos/github.api.dto';

@Entity()
export class ColumnEntity extends EntityBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    external_id: number;

    @Column()
    name: string;

    @Column()
    url: string;

    @Column()
    proj_id: number;

    static from(data: GitColumnAPIResponse): ColumnEntity{
        return {
            ...new ColumnEntity(),
            external_id: data.external_id,
            name: data.name,
            url: data.url
        }
    }
}
