import { EntityBase } from 'src/shared/base/entity.base';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Hook extends EntityBase{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    external_id: number;

    @Column()
    active: boolean;

    @Column()
    url: string;

    @Column({nullable: true})
    owner: string;

    @Column({nullable: true})
    repo_id: number;

    static from(response: any){
        return {
            ...new Hook(),
            external_id: response['data'].id,
            active: response['data'].active,
            url: response['data'].url
        }
    }
}