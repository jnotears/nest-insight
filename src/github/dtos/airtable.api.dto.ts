import { IssueEntity } from "../entities/issue.entity";

export interface AirTableIssueHandling {
    issue: IssueEntity,
    record_id: string,
    project_name: string,
}