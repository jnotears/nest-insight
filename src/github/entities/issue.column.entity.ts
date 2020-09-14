import { EntityBase } from 'src/shared/base/entity.base';
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class IssueColumnEntity extends EntityBase{
    @PrimaryColumn()
    issue_id: number;

    @PrimaryColumn()
    proj_id: number;

    @Column()
    col_id: number;

}
