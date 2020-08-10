export class IssueDTO{
    id: number;
    issueNumber: number;
    name: string;
    author: string;
    content: string;
    estimate: Date;
    repositoryId: number;
}