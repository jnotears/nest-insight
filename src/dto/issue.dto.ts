export class IssueDTO{
    id: number;
    issueNumber: number;
    name: string;
    author: string;
    content: string;
    url: string;
    estimate: Date;
    repositoryId: number;
}