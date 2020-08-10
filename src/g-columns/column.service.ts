import { Injectable, HttpService } from '@nestjs/common';
import { Converter } from '../helper/converter';
import { gitGraphqlApiUrl, httpOptions } from '../helper/http-helper';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class ColumnService {

    constructor(
        private readonly http: HttpService,
        private readonly converter: Converter
    ) { }

    getColumns(owner: string, repositoryName: string): Observable<AxiosResponse<any>> {
        const graph = `{
                repository(owner: "${owner}", name: "${repositoryName}"){
                    projects(last:100){
                        edges{
                            node{
                                columns(last:100){
                                    edges{
                                        node{
                                            name
                                            createdAt
                                            updatedAt
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }`;
        const query = { "query": graph };
        return this.http.post<any>(gitGraphqlApiUrl, query, httpOptions);
    }
}