export class MilestoneDTO{
    id: number;
    number: number;
    title: string;
    creator: string;
    dueOn: Date;
    createdAt: Date;
    closedAt: Date;
    state: string;
    repositoryId: number;
}