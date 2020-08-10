import { Injectable, HttpService } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { gitGraphqlApiUrl, httpOptions } from '../helper/http-helper';
import { Converter } from 'src/helper/converter';

@Injectable()
export class IssueService {

    constructor(
        private readonly http: HttpService,
        private readonly converter: Converter
    ) { }

    getIssues(owner: string, repositoryName: string): Observable<AxiosResponse<any>> {
        const graph = `{
            repository(owner: "${owner}", name: "${repositoryName}"){
                issues(last: 100){
                    edges{
                        node{
                            databaseId
                            title
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
    getIssue(owner: string,repositoryName: string, number: number): Observable<AxiosResponse<any>> {
        const graph = `{
            repository(owner: ${owner}, name: ${repositoryName}){
                issue(number: ${number}){
                    databaseId
                    title
                    url
                    author{
                        login
                    }
                    body
                }
            }
        }`;
        const query = {"query": this.converter.stringToGraphQl(graph)};
        return this.http.post<any>(gitGraphqlApiUrl, query, httpOptions);
    }
}