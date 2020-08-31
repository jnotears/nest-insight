import { EntityBase } from 'src/shared/base/entity.base';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class IssueAssigneeEntity extends EntityBase{
    @PrimaryColumn()
    external_issue_id: number;

    @PrimaryColumn()
    username: string;
}