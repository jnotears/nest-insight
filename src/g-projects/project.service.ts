import { Injectable, HttpService } from '@nestjs/common';
import { Converter } from 'src/helper/converter';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { gitGraphqlApiUrl, httpOptions } from '../helper/http-helper';
import { InjectRepository } from '@nestjs/typeorm';
import { GProject } from './project.entity';
import { Repository } from 'typeorm';
import { ProjectDTO } from 'src/dto/project.dto';

@Injectable()
export class ProjectService {

    constructor(
        private readonly http: HttpService,
        private readonly converter: Converter,
        @InjectRepository(GProject) private readonly projectRepository: Repository<GProject>
    ) { }

    getProjects(username: string): Observable<AxiosResponse<any>> {
        const graph = `{
            user(login: "${username}"){
                repositories(last: 100){
                    edges{
                        node{
                            databaseId
                            projects(last: 100){
                                edges{
                                    node{
                                        databaseId
                                        number
                                        name
                                        body
                                        state
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

    getProjectNode(node: object): ProjectDTO {
        const project = new ProjectDTO();
        project.id = node["databaseId"];
        project.number = node["number"];
        project.name = node["name"];
        project.content = node["body"];
        project.state = node["state"];
        return project;
    }

    fillData(username: string) {
        this.getProjects(username).subscribe(
            val => {
                if (val) {
                    const repositories = val.data.data.user.repositories.edges;
                    if (repositories && repositories.length > 0) {
                        for (let repository of repositories) {
                            const repositoryId = repository.node.databaseId;
                            const projects = repository.node.projects.edges;
                            if (projects && projects.length > 0) {
                                for (let project of projects) {
                                    const proj: ProjectDTO = this.getProjectNode(project.node);
                                    if (proj) {
                                        proj.repositoryId = repositoryId;
                                        this.projectRepository.save(proj);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        )
    }
}