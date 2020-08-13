import { Injectable, HttpService } from '@nestjs/common';
import { gitGraphqlApiUrl, httpOptions } from '../helper/http-helper';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Converter } from '../helper/converter';
import { ColumnDTO } from '../dto/column.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GColumn } from '../g-columns/column.entity';

@Injectable()
export class ColumnService {

    constructor(
        private readonly http: HttpService,
        private readonly converter: Converter,
        @InjectRepository(GColumn) private readonly gColRepository: Repository<GColumn>
    ) { }

    getColumns(username): Observable<AxiosResponse<any>> {
        const graph = `{
            user(login: "${username}"){
                repositories(last:100){
                    edges{
                        node{
                            projects(last: 100){
                                edges{
                                    node{
                                        databaseId
                                        columns(last:10){
                                            edges{
                                                node{
                                                    databaseId
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
                    }
                }
            }
        }`;
        const query = { "query": this.converter.stringToGraphQl(graph) };
        return this.http.post<any>(gitGraphqlApiUrl, query, httpOptions);
    }

    getColumnNode(node: object): ColumnDTO {
        const gColumn: ColumnDTO = new ColumnDTO();
        gColumn.id = node["databaseId"];
        gColumn.name = node["name"];
        gColumn.createdAt = node["createdAt"];
        gColumn.updatedAt = node["updatedAt"];
        return gColumn;
    }

    fillData(username: string) {
        this.getColumns(username).subscribe(
            val => {
                console.log(val);
                const repositories = val.data.data.user.repositories.edges;
                if(repositories && repositories.length > 0){
                    for(let repository of repositories){
                        const projects = repository.node.projects.edges;
                        if (projects && projects.length > 0) {
                            for (let project of projects) {
                                const projectId = project.node.databaseId;
                                const columns = project.node.columns.edges;
                                if(columns && columns.length > 0){
                                    for (let column of columns) {
                                        const gColumn: ColumnDTO = this.getColumnNode(column.node);
                                        if (gColumn) {
                                            gColumn.projectId = projectId;
                                            this.gColRepository.save(gColumn);
                                        }
                                    }
                                } 
                            }
                        }
                    }
                } 
            }
        );
    }
}