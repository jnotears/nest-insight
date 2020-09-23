import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TableAirTable{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    issue_id: string;

    @Column({nullable: true})
    external_id: string;

    @Column({nullable: true})
    number: string;

    @Column({nullable: true})
    name: string;

    @Column({nullable: true})
    state: string;

    @Column({nullable: true})
    author: string;

    @Column({nullable: true})
    content: string;

    @Column({nullable: true})
    url: string;

    @Column({nullable: true})
    repo_id: string;

    @Column({nullable: true})
    closed_at: string;

    @Column({nullable: true})
    estimate: string;

    @Column({nullable: true})
    assignee: string;

    @Column()
    config_id: number;

    @Column({nullable: true})
    created_at: string;

    @Column({nullable: true})
    updated_at: string;
    
    @Column({nullable: true})
    project_name: string;
}
