import { IssueAssigneeDTO } from './../dto/issue-assignee.dto';
import { gitGraphqlApiUrl, httpOptions } from 'src/helper/http-helper';
import { GIssueAssignee } from './issueAssignee.entity';
import { Injectable, Body, HttpService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class IssueAssigneeService {
    constructor(
        @InjectRepository(GIssueAssignee) private repo: Repository<GIssueAssignee>,
        private http: HttpService,
    ) { }

    getIssueAssignees(username: string): Observable<AxiosResponse<any>> {
        const graph = `{
            user(login: "${username}") { 
                issues(last: 100){
                    edges{
                        node{
                            databaseId
                            createdAt
                            assignees(last: 100){
                                edges{
                                    node{
                                        databaseId
                                        createdAt
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }`
        const query = { "query": graph };
        return this.http.post<any>(gitGraphqlApiUrl, query, httpOptions);
    }

    createIssueAssignees(data, issue_id): IssueAssigneeDTO{
        const issueAssigneeDto: IssueAssigneeDTO = {
            issue_id: issue_id,
            user_id: data.databaseId,
            createdAt: data.createdAt,
        }
        return issueAssigneeDto;
    }

    insertIssueAssignees(username: string) {
        this.getIssueAssignees(username).subscribe(val => {
            const data = val.data.data.user.issues.edges;
            if(data.length > 0){
                data.forEach(issue => {
                    const issue_id = issue.node.databaseId;
                    const assignees = issue.node.assignees.edges;
                    if(assignees.length > 0){
                        assignees.forEach(assignee => {
                            const issueAssigneeDto: IssueAssigneeDTO = this.createIssueAssignees(assignee.node, issue_id);
                            if(issueAssigneeDto){
                                this.repo.save(issueAssigneeDto);
                            }
                        });
                    }
                });
            }
        })
    }

    listenIssueAssignee(data){
        if(data.action == 'assigned'){
            const issueAssigneeDto: IssueAssigneeDTO = {
                issue_id: data.issue.id,
                user_id: data.assignee.id,
                createdAt: data.issue.updated_at,
            }
            if(issueAssigneeDto){
                this.repo.save(issueAssigneeDto);
            }
        }
        if(data.action == 'unassigned'){
            const issue_id = data.issue.id;
            const user_id = data.assignee.id;
            this.repo.delete({
                issue_id: issue_id,
                user_id: user_id,
            });
        }
    }
}