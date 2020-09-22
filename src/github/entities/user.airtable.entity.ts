import { EntityBase } from 'src/shared/base/entity.base';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UserAirTable extends EntityBase{
    @PrimaryColumn()
    user_id: string;

    @PrimaryColumn()
    api_key: string;

    @PrimaryColumn()
    base_id: string;

    @PrimaryColumn()
    table_name: string;

    @Column()
    connect_name: string;

    @Column({default: false})
    active: boolean;
}
