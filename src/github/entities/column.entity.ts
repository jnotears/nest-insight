import { EntityBase } from 'src/shared/base/entity.base';
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class ColumnEntity extends EntityBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    external_id: number;

    @Column()
    name: string;

    @Column()
    url: string;

    @Column()
    external_proj_id: number;
}