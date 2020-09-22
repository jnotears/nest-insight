import { EntityBase } from 'src/shared/base/entity.base';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class IssueAirTable extends EntityBase{
    @PrimaryColumn()
    issue_id: number;

    @PrimaryColumn()
    record_id: string;

    @Column()
    issue_name: string;

    @Column()
    project_name: string;
}
