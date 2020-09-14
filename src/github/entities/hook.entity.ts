import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Hook {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    external_id: number;

    @Column()
    active: boolean;

    @Column()
    url: string;

    @Column()
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