import { EntityBase } from 'src/shared/base/entity.base';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Assignee extends EntityBase{
    @PrimaryColumn()
    issue_id: number;

    @PrimaryColumn()
    user_id: string;

}
