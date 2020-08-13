import { IssueLabelDTO } from './../dto/issue-label.dto';
import { LabelDTO } from '../dto/label.dto';
import { gitGraphqlApiUrl, httpOptions } from 'src/helper/http-helper';
import { GIssueLabel } from './issueLabel.entity';
import { Injectable, Body, HttpService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class IssueLabelService {
    constructor(
        @InjectRepository(GIssueLabel) private repo: Repository<GIssueLabel>,
        private http: HttpService,
    ) { }

    getIssueLabels(username: string): Observable<AxiosResponse<any>> {
        const graph = `{
            user(login: "${username}") { 
                repositories(last: 50){
                  edges{
                    node{
                      databaseId
                      issues(last:50){
                        edges{
                          node{
                            databaseId
                            labels(last:50){
                              edges{
                                node{
                                  name
                                  createdAt
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

    createIssueLabel(issue_id, label_id, createdAt): IssueLabelDTO{
        const issueLabelDto: IssueLabelDTO = {
            issue_id: issue_id,
            label_id: label_id,
            createdAt: createdAt,
        }
        return issueLabelDto;
    }

    insertIssueLabels(username: string) {
        this.getIssueLabels(username).subscribe(val => {
            const data = val.data.data.user.repositories.edges;
            if(data.length > 0){
                data.forEach(ele => {
                    const repo_id = ele.node.databaseId;
                    const issuesData = ele.node.issues.edges;
                    if(issuesData){
                        issuesData.forEach(issue => {
                            const issue_id = issue.node.databaseId;
                            const labelsData = issue.node.labels.edges;
                            if(labelsData){
                                labelsData.forEach(label => {
                                    const label_name = label.node.name;
                                    const created_at = label.node.createdAt;
                                    const query = `
                                        SELECT g_label."id"
                                        FROM g_label
                                        WHERE g_label."repositoryId" = ${repo_id}
                                        AND g_label."name" = '${label_name}'
                                    `;
                                    this.repo.query(query).then(val => {
                                        const issueLabel: IssueLabelDTO = this.createIssueLabel(issue_id, val[0].id, created_at);
                                        if(issueLabel){
                                            this.repo.save(issueLabel);
                                        }
                                    }).catch(err => console.error(err));
                                    
                                });
                            }
                        });
                    }
                });
            }
        })
    }
}