import { EntityBase } from 'src/shared/base/entity.base';
import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ProjectAirTable extends EntityBase{
    @PrimaryColumn()
    project_id: number;

    @PrimaryColumn()
    config_id: number;
}
