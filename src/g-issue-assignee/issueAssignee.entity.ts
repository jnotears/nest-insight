import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class GIssueAssignee{
    @PrimaryColumn()
    issue_id: number;

    @PrimaryColumn()
    user_id: number;

    @Column()
    createdAt: Date;
}