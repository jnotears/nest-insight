import { IssueColumnDTO } from './../dto/issue-column.dto';
import { gitGraphqlApiUrl, httpOptions } from 'src/helper/http-helper';
import { GIssueColumn } from './issueColumn.entity';
import { Injectable, Body, HttpService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class IssueColumnService {
    constructor(
        @InjectRepository(GIssueColumn) private repo: Repository<GIssueColumn>,
        private http: HttpService,
    ) { }

    getIssueColumns(username: string): Observable<AxiosResponse<any>> {
        const graph = `{
            user(login: "${username}") { 
                repositories(last:50){
                    edges{
                        node{
                          issues(last: 50){
                            edges{
                              node{
                                databaseId
                                updatedAt
                                projectCards(last:50){
                                  edges{
                                    node{
                                      column{
                                        databaseId
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                    }
                }
            }
        }`
        const query = { "query": graph };
        return this.http.post<any>(gitGraphqlApiUrl, query, httpOptions)
    }

    createIssueColumn(issue_id, col_id, updated_at): IssueColumnDTO{
        const issueColumnDto: IssueColumnDTO = {
            issue_id: issue_id,
            col_id: col_id,
            updated_at: updated_at,
        }
        return issueColumnDto;
    }

    insertIssueColumns(username: string) {
        this.getIssueColumns(username).subscribe(val => {
            const data = val.data.data.user.repositories.edges;
            if(data.length > 0){
                data.forEach(ele => {
                    const issuesData = ele.node.issues.edges;
                    if(issuesData.length > 0){
                        issuesData.forEach(issue => {
                            const issue_id = issue.node.databaseId;
                            const updated_at = issue.node.updatedAt;
                            const projectsData = issue.node.projectCards.edges;
                            if(projectsData){
                                projectsData.forEach(proj => {
                                    const column_id = proj.node.column.databaseId;
                                    const issueColumnDto = this.createIssueColumn(issue_id, column_id, updated_at);
                                    if(issueColumnDto){
                                        this.repo.save(issueColumnDto);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        })
    }
}