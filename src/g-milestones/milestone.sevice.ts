import { Injectable, HttpService } from '@nestjs/common';
import { Converter } from 'src/helper/converter';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { httpOptions, gitGraphqlApiUrl } from '../helper/http-helper';

@Injectable()
export class MilestoneService {

    constructor(
        private readonly http: HttpService,
        private readonly converter: Converter
    ) { }

    getMilestones(owner: string, repositoryName: string): Observable<AxiosResponse<any>> {
        const graph = `{
            repository(owner: "${owner}", name: "${repositoryName}"){
                milestones(last: 100){
                    edges{
                        node{
                            number
                            title
                            dueOn
                            createdAt
                            closedAt
                            creator{
                                login
                            }
                            closed
                        }
                    }
                }
            }
        }`;
        const query = {"query": this.converter.stringToGraphQl(graph)};
        return this.http.post<any>(gitGraphqlApiUrl, query, httpOptions);
    }
}