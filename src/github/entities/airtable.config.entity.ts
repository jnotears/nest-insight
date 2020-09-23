import { EntityBase } from 'src/shared/base/entity.base';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AirTableConfig extends EntityBase{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: string;

    @Column()
    api_key: string;

    @Column()
    base_id: string;

    @Column()
    table_name: string;

    @Column()
    connect_name: string;

    @Column({default: false})
    active: boolean;
}
