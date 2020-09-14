import { EntityBase } from 'src/shared/base/entity.base';
import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class IssueTimeline extends EntityBase{
    @PrimaryColumn()
    issue_id: number;

    @PrimaryColumn()
    col_id: number;
}
