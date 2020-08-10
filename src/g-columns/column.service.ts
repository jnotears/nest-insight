import { Injectable, HttpService } from '@nestjs/common';
import { gitGraphqlApiUrl, httpOptions } from '../helper/http-helper';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Converter } from '../helper/converter';
import { GColumnDTO } from '../dto/column.dto';
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

    getColumns(owner: string, repositoryName: string): Observable<AxiosResponse<any>> {
        const graph = `{
                repository(owner: "${owner}", name: "${repositoryName}"){
                    projects(last:100){
                        edges{
                            node{
                                databaseId
                                columns(last:100){
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
            }`;
        const query = { "query": this.converter.stringToGraphQl(graph) };
        return this.http.post<any>(gitGraphqlApiUrl, query, httpOptions);
    }

    getColumnNode(node: object): GColumnDTO {
        const gColumn: GColumnDTO = new GColumnDTO();
        gColumn.id = node["databaseId"];
        gColumn.name = node["name"];
        gColumn.createdAt = node["createdAt"];
        gColumn.updatedAt = node["updatedAt"];
        return gColumn;
    }

    fillData(owner: string, repositoryName: string) {
        this.getColumns(owner, repositoryName).subscribe(
            val => {
                const projects = val.data.data.repository.projects.edges;
                if (projects) {
                    for (let project of projects) {
                        const projectId = project.node.databaseId;
                        const columns = project.node.columns.edges;
                        for (let column of columns) {
                            const gColumn: GColumnDTO = this.getColumnNode(column.node);
                            if (gColumn) {
                                gColumn.projectId = projectId;
                                this.gColRepository.save(gColumn);
                            }
                        }
                    }
                }
            }
        );
    }
}