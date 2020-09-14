import { EntityBase } from 'src/shared/base/entity.base';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class IssueLabelEntity extends EntityBase{
    @PrimaryColumn()
    issue_id: number;

    @PrimaryColumn()
    label_id: number;
}