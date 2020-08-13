import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class GIssueColumn{
    @PrimaryColumn()
    issue_id: number;

    @PrimaryColumn()
    col_id: number;

    @Column()
    updated_at: Date;
}