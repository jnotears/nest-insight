import { LabelDTO } from './../dto/label.dto';
import { gitGraphqlApiUrl, httpOptions } from 'src/helper/http-helper';
import { GLabel } from './label.entity';
import { Injectable, Body, HttpService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class LabelService {
    constructor(
        @InjectRepository(GLabel) private repoLabel: Repository<GLabel>,
        private http: HttpService,
    ) { }

    getLabels(username: string): Observable<AxiosResponse<any>> {
        const graph = `{
            user(login: "${username}") { 
                repositories(last: 100){
                    edges{
                        node{
                        databaseId
                            labels(last: 100){
                                edges{
                                    node{
                                        name
                                        color
                                        description
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

    createLabelDTO(nodeData, repo_id): LabelDTO{
        const labelDto: LabelDTO = {
            id: null,
            name: nodeData.name,
            description: nodeData.description,
            color: nodeData.color,
            repositoryId: repo_id,
        }
        return labelDto;
    }

    insertLabels(username: string) {
        this.getLabels(username).subscribe(val => {
            const data = val.data.data.user.repositories.edges;
            if(data.length > 0){
                data.forEach(ele => {
                    const repo_id = ele.node.databaseId;
                    const labelsData = ele.node.labels.edges;
                    if(labelsData.length > 0){
                        labelsData.forEach(label => {
                            const labelDto = this.createLabelDTO(label.node, repo_id);
                            this.repoLabel.save(labelDto);
                        });
                    }
                });
            }
        })
    }
}