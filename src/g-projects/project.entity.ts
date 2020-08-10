import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class GProject {
    @PrimaryColumn()
    id: number;

    @Column()
    number: number;

    @Column()
    name: string;
    
    @Column()
    content: string;

    @Column()
    state: string;

    @Column()
    repositoryId: number;
}