import { Injectable, HttpService } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { gitGraphqlApiUrl, httpOptions } from '../helper/http-helper';
import { Converter } from '../helper/converter';

@Injectable()
export class UserService {

    constructor(
        private readonly http: HttpService,
        private readonly converter: Converter
    ) { }

    getUser(): Observable<AxiosResponse<any>> {
        const graph = `query{
            viewer{
                login
                url
            }
        }`;
        const query = {"query": this.converter.stringToGraphQl(graph)}; 
        return this.http.post<any>(gitGraphqlApiUrl, query, httpOptions)
    }
}