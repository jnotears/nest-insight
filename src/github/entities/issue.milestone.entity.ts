import { EntityBase } from 'src/shared/base/entity.base';
import { Entity, PrimaryColumn } from 'typeorm';
	
@Entity()
export class IssueMileStoneEntity extends EntityBase{
	
    @PrimaryColumn()
    issue_id: number;
	
    @PrimaryColumn()
    milestone_id: number;
}
