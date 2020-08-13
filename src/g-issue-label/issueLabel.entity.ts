import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class GIssueLabel{
    @PrimaryColumn()
    issue_id: number;

    @PrimaryColumn()
    label_id: number;

    @Column()
    createdAt: Date;
}