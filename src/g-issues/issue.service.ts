import { Injectable, HttpService } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { gitGraphqlApiUrl, httpOptions } from '../helper/http-helper';
import { Converter } from 'src/helper/converter';
import { IssueDTO } from 'src/dto/issue.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GIssue } from './issue.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IssueService {

    constructor(
        private readonly http: HttpService,
        private readonly converter: Converter,
        @InjectRepository(GIssue) private readonly issueRepository: Repository<GIssue>
    ) { }

    getIssues(owner: string, repositoryName: string): Observable<AxiosResponse<any>> {
        const graph = `{
            repository(owner: "${owner}", name: "${repositoryName}"){
                databaseId
                issues(last: 100){
                    edges{
                        node{
                            databaseId
                            number
                            title
                            body
                            url
                            author{
                                login
                            }
                        }
                    }
                }
            }
        }`;
        const query = {"query": this.converter.stringToGraphQl(graph)};
        return this.http.post<any>(gitGraphqlApiUrl, query, httpOptions);
    }

    getIssueNode(node: object): IssueDTO{
        const issue = new IssueDTO();
        issue.id = node["databaseId"];
        issue.issueNumber = node["number"];
        issue.name = node["title"];
        issue.content = node["body"];
        issue.author = node["author"].login;
        return issue;
    }

    fillData(owner: string, repositoryName: string){
        this.getIssues(owner,repositoryName).subscribe(
            val => {
                const issues = val.data.data.repository.issues.edges;
                const repositoryId = val.data.data.repository.databaseId;
                if(issues){
                    for(let issue of issues){
                        const gIssue = this.getIssueNode(issue.node);
                        if(gIssue){
                            gIssue.repositoryId = repositoryId;
                            this.issueRepository.save(gIssue);
                        }
                    }
                }
            }
        )
    }
}