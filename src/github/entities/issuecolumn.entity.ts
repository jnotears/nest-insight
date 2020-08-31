import { EntityBase } from 'src/shared/base/entity.base';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { extname } from 'path';

@Entity()
export class IssueColumnEntity extends EntityBase{
    @PrimaryColumn()
    external_issue_id: number;

    @PrimaryColumn()
    external_col_id: number;
}