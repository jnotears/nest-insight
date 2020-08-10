import { Injectable, HttpService } from '@nestjs/common';
import { Converter } from 'src/helper/converter';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { gitGraphqlApiUrl, httpOptions } from '../helper/http-helper';

@Injectable()
export class ProjectService {

    constructor(
        private readonly http: HttpService,
        private readonly converter: Converter
    ) { }

    getProjects(owner: string, repositoryName: string): Observable<AxiosResponse<any>> {
        const graph = `{
            repository(owner: ${owner}, name: ${repositoryName}){
                projects(last: 100){
                    edges{
                        node{
                            number
                            name
                            url
                            body
                        }
                    }
                }
            }
        }`;
        const query = this.converter.stringToGraphQl(graph);
        return this.http.post<any>(gitGraphqlApiUrl, query, httpOptions);
    }
}